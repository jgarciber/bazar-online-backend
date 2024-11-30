const express = require('express');
const router = express.Router();
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');

const pdf = require("html-pdf");
const fs = require("fs");
const ubicacionPlantilla = require.resolve("../templates/order-pdf-template.html");
let contenidoHtml = fs.readFileSync(ubicacionPlantilla, 'utf8')
const puppeteer = require('puppeteer');
// (async () => {
//     const executablePath = puppeteer.executablePath();
//     console.log('Ruta al ejecutable de Chromium:', executablePath);
// })();

// const path = require('path');
// // Especifica la ruta completa a phantomjs
// const options = {
//     phantomPath: path.resolve('./node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs.exe')
// };


// Almacena los pedidos realizados por los usuarios.
// Campos: ‘id’ (clave primaria), ‘user_id’ (clave foránea de ‘users’), ‘total_articles’, ‘subtotal’, ‘discount’, ‘total’, ‘entre otros’.
// Relación: Se relaciona con ‘users’ mediante la clave foránea ‘user_id’. Si un usuario es eliminado, 
// los pedidos asociados mantienen la relación con NULL (ON DELETE SET NULL).

router.get('/', middleware.authToken, (req, res) => {
    if(req.user.is_admin){
        if(req.query.q){
            db.obtenerBusquedaPedido((rows) => {
                res.send(rows)
            }, req.query.q)
        }else{
            db.obtenerPedidos((rows) => {
                res.send(rows)
            })
        }
    }else{
        db.obtenerPedidosUsuario((rows) => {
            res.send(rows)
        }, req.user.user_id)
    }
});

router.post('/', middleware.authToken, (request, response) => {
    // Comprobación si el usuario que realiza la compra es el mismo que se ha logueado (se podría haber cambiado en el cliente con la variable user_id)
    if(request.user.user_id != request.body.user_id) return response.sendStatus(403)
    db.insertarPedido((rows) => {
        response.status(201).send(rows)
    }, request.body);
});

router.get('/factura-pdf', middleware.authToken, async (req, res) => {
    // pdf.create(contenidoHtml, options).toStream((error, stream) => {
    //     if (error) {
    //         res.end("Error creando PDF: " + error)
    //     } else {
    //         res.setHeader("Content-Type", "application/pdf");
    //         stream.pipe(res);
    //     }
    // });
    const executablePath = puppeteer.executablePath();
    console.log('Ruta al ejecutable de Chromium:', executablePath);
    try {
        // const browser = await puppeteer.launch();
        // Ruta a Chromium instalada en Docker
        const browser = await puppeteer.launch({
            // executablePath: '/usr/bin/chromium',  // Asegúrate de que esta ruta sea correcta
            executablePath: puppeteer.executablePath(),  // Usa la ruta automática de Puppeteer
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necesarios en entornos sin acceso a entorno gráfico
        });
        const page = await browser.newPage();
        await page.setContent(contenidoHtml);
        const pdfBuffer = await page.pdf();

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error creando PDF:", error);
        res.status(500).send("Error creando PDF: " + error);
    }
});

module.exports = router;
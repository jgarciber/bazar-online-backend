const express = require('express');
const router = express.Router();
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');

const { z } = require('zod');

// Esquema de validación para los datos del pedido (todos los valores recibidos como string)
const orderSchema = z.object({
    user_id: z.string()
        .transform(value => parseInt(value, 10)) // Convertir el string a número
        .refine(value => !isNaN(value) && value > 0, "El 'user_id' debe ser un número mayor que 0"),

    total_articulos: z.string()
        .transform(value => parseInt(value, 10)) // Convertir el string a número
        .refine(value => !isNaN(value) && value >= 1, "Debe haber al menos un artículo en el pedido"),

    subtotal: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El subtotal no puede ser negativo"),

    descuento: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El descuento no puede ser negativo"),

    descuentoTotal: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El descuento total no puede ser negativo"),

    subtotalConDescuento: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El subtotal con descuento no puede ser negativo"),

    impuesto: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El impuesto no puede ser negativo"),

    impuestos: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "Los impuestos no pueden ser negativos"),

    totalFinal: z.string()
        .transform(value => parseFloat(value)) // Convertir el string a número flotante
        .refine(value => !isNaN(value) && value >= 0, "El total final no puede ser negativo")
})
.refine((data) => data.totalFinal >= data.subtotalConDescuento, {
    message: "El total final no puede ser menor que el subtotal con descuento",
    path: ["totalFinal"]
});

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

router.post('/', middleware.authToken, async (request, response) => {
    try {
        // Validar los datos del pedido usando Zod
        const validatedOrder = orderSchema.parse(request.body); // Validar los datos con el esquema de Zod

        // Comprobación si el usuario que realiza la compra es el mismo que se ha logueado
        if (request.user.user_id !== validatedOrder.user_id) {
            return response.sendStatus(403);  // El usuario que realiza la compra no es el mismo que el usuario autenticado
        }

        // Insertar el pedido en la base de datos
        db.insertarPedido((rows) => {
            response.status(201).json({
                message: 'Pedido creado correctamente',
                // orderId: rows.insertId  // Asumimos que `insertId` es el ID del nuevo pedido
            });
        }, validatedOrder);

    } catch (error) {
        // Si Zod valida incorrectamente, devolver un error con los detalles
        response.status(400).json({
            message: "Error de validación de datos",
            errors: error.errors  // Aquí retornamos los errores de Zod
        });
    }
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
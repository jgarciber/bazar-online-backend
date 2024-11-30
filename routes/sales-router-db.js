const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');

// Registra las ventas de productos realizadas a través de pedidos.
// Campos: ‘id’ (clave primaria), ‘product_id’ (clave foránea de ‘products’), ‘user_id’ (clave foránea de ‘users’), 
// ‘order_id’ (clave foránea de ‘orders’), ‘quantity’, ‘total’, ‘sale_date’.
// Relación: Se asocia con ‘products’, ‘users’ y ‘orders’ a través de las claves foráneas correspondientes. 
// Si un producto, usuario o pedido se elimina, la relación se actualiza a NULL.

router.get('/', middleware.authToken, (request, response) => {
    if(request.user.is_admin){
        if(request.query.q){
            db.obtenerBusquedaVentas((rows) => {
                response.send(rows)
            }, request.query.q, request.query.type, request.query.startDate, request.query.endDate)
        }else{
            db.obtenerVentasCompleto((rows) => {
                response.send(rows)
            })
        }
    }else{
        db.obtenerVentasUsuario((rows) => {
            response.send(rows)
        }, request.user.user_id)
    }
});

router.post('/', middleware.authToken, (request, response) => {
    // Comprobación si el usuario que realiza la compra es el mismo que se ha logueado (se podría haber cambiado en el cliente con la variable user_id)
    if(request.user.user_id != request.body.order.user_id) return response.sendStatus(403)
    db.insertarVenta((rows) => {
        response.status(201).send(rows)
    }, request.body.product, request.body.order);
});


module.exports = router;
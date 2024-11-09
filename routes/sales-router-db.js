const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');


router.get('/', middleware.authToken, (request, response) => {
//     sales
// : Almacena las ventas realizadas.
// id: int (PK, autoincremental)
// product_id: int (FK que referencia a products.id)
// quantity: int (Cantidad vendida)
// total: decimal(10,2) (Precio total de la venta)
// sale_date: timestamp (Fecha de la venta)
    
    // response.send(db.obtenerProductos());
    db.obtenerVentasCompleto((rows) => {
        response.send(rows)
    })
});

router.post('/', middleware.authToken, (request, response) => {
    db.insertarVenta((rows) => {
        response.status(201).send(rows)
    }, request.body);
});


module.exports = router;
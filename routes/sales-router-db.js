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
const express = require('express');
const router = express.Router();
// const products = require('../reposories/product-repositories');
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')


router.get('/', middleware.authToken, (request, response) => {
    // products
    // : Almacena información sobre productos.
    // id: int (PK, autoincremental)
    // name: varchar(100) (Nombre del producto)
    // price: decimal(10,2) (Precio del producto)
    // stock: int (Cantidad en stock)
    // category: varchar(50) (Categoría del producto)
    // created_at: timestamp (Fecha de creación)
    
    // console.log(request.params)
    // console.log(request.query)
    if(request.query.q){
        db.obtenerBusquedaProductos((rows) => {
            response.send(rows)
        }, request.query.q)
    }else if (request.query.cat){
        db.obtenerBusquedaProductosPorCategoria((rows) => {
            response.send(rows)
        }, request.query.cat)
    }else{
        db.obtenerProductos((rows) => {
            response.send(rows)
        })
    }
});

router.post('/', middleware.authTokenAdmin, (request, response) => {
    db.insertarProducto((rows) => {
        response.status(201).send(rows)
    }, request.body);
});

router.put('/:id', middleware.authTokenAdmin, (request, response) => {
    db.modificarProducto((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id, request.body);
});

router.delete('/:id', middleware.authTokenAdmin, (request, response) => {
    db.borrarProducto((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id);
});

module.exports = router;
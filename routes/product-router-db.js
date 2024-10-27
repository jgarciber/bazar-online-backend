const express = require('express');
const router = express.Router();
// const products = require('../reposories/product-repositories');
const DB = require('../db')
const db = new DB ('localhost', 'root', '');


router.get('/', (request, response) => {
    // products
    // : Almacena información sobre productos.
    // id: int (PK, autoincremental)
    // name: varchar(100) (Nombre del producto)
    // price: decimal(10,2) (Precio del producto)
    // stock: int (Cantidad en stock)
    // category: varchar(50) (Categoría del producto)
    // created_at: timestamp (Fecha de creación)
    
    // response.send(db.obtenerProductos());
    db.obtenerProductos((rows) => {
        response.send(rows)
    })
});

router.post('/', (request, response) => {
    db.insertarProducto((rows) => {
        response.status(201).send(rows)
    }, request.body);
});

router.put('/:id', (request, response) => {
    db.modificarProducto((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id, request.body);
});

router.delete('/:id', (request, response) => {
    db.borrarProducto((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id);
});

module.exports = router;
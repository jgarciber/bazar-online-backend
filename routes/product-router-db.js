const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')

// products (Productos):
// Contiene los productos disponibles en la tienda.
// Campos: ‘id’ (clave primaria), ‘name’, ‘price’, ‘stock’, ‘category’ (clave foránea de ‘categories’), ‘created_at’.
// Relación: Se asocia con ‘categories’ a través de la clave foránea ‘category’. Si se elimina una categoría, los productos
// relacionados se eliminan automáticamente.

router.get('/', middleware.authToken, (request, response) => {
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
        response.status(201).json({
            message: `Se ha añadido el producto '${request.body.name}' correctamente`
        });
    }, request.body);
});

router.put('/:id', middleware.authTokenAdmin, (request, response) => {
    db.modificarProducto((rows) => {
        if (rows != null){
            // response.status(204).send();
            response.status(200).json({
                message: `Se ha modificado el producto '${request.body.name}' correctamente`
            });
        }else{
            response.status(404).send();
        }
    }, request.params.id, request.body);
});

router.delete('/:id', middleware.authTokenAdmin, (request, response) => {
    db.borrarProducto((rows) => {
        if (rows != null){
            // response.status(204).send();
            response.status(200).json({
                message: `Se ha borrado el producto correctamente`
            });
        }else{
            response.status(404).send();
        }
    }, request.params.id);
});

module.exports = router;
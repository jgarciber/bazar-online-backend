const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')

// categories (Categorías):
// Almacena las categorías de los productos.
// Campos: ‘id’ (clave primaria), ‘name’ (nombre de la categoría), ‘description’ (descripción).
// Relación: La tabla ‘products’ referencia esta tabla mediante la clave foránea ‘category’. 
// Si se elimina una categoría, los productos asociados también se eliminan (ON DELETE CASCADE).

router.get('/', middleware.authToken, (request, response) => {   
    db.obtenerCategorias((rows) => {
        response.send(rows)
    })
});

router.post('/', middleware.authTokenAdmin, (request, response) => {
    db.insertarCategoria((rows) => {
        response.status(201).json({
            message: `Se ha añadido la categoría '${request.body.name}' correctamente`
        });
    }, request.body);
});

router.put('/:id', middleware.authTokenAdmin, (request, response) => {
    db.modificarCategoria((rows) => {
        if (rows != null){
            // response.status(204).send();
            response.status(200).json({
                message: `Se ha modificado la categoría '${request.body.name}' correctamente`
            });
        }else{
            response.status(404).send();
        }
    }, request.params.id, request.body);
});

router.delete('/:id', middleware.authTokenAdmin, (request, response) => {
    db.borrarCategoria((rows) => {
        if (rows != null){
            // response.status(204).send();
            response.status(200).json({
                message: 'Se ha borrado la categoría correctamente'
            });
        }else{
            response.status(404).send();
        }
    }, request.params.id);
});

module.exports = router;
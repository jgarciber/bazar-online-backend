const express = require('express');
const router = express.Router();
// const products = require('../reposories/product-repositories');
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')


router.get('/', middleware.authToken, (request, response) => {
    // categorias
    // : Almacena información sobre categorías.
    // id: int (PK, autoincremental)
    // name: varchar(100) (Nombre de la categoría)
    // description: text (Descripción de la categoría)
    
    // response.send(db.obtenerCategorias());
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
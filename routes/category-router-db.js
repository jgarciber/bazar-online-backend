const express = require('express');
const router = express.Router();
// const products = require('../reposories/product-repositories');
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')


router.get('/', middleware.auth, (request, response) => {
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

router.post('/', middleware.authAdmin, (request, response) => {
    db.insertarCategoria((rows) => {
        response.status(201).send(rows)
    }, request.body);
});

router.put('/:id', middleware.authAdmin, (request, response) => {
    db.modificarCategoria((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id, request.body);
});

router.delete('/:id', middleware.authAdmin, (request, response) => {
    db.borrarCategoria((rows) => {
        if (rows != null){
            response.status(201).send();
        }else{
            response.status(404).send();
        }
    }, request.params.id);
});

module.exports = router;
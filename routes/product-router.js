const express = require('express');
const router = express.Router();
const products = require('../reposories/product-repositories');

router.get('/', (request, response) => {
    // products
    // : Almacena información sobre productos.
    // id: int (PK, autoincremental)
    // name: varchar(100) (Nombre del producto)
    // price: decimal(10,2) (Precio del producto)
    // stock: int (Cantidad en stock)
    // category: varchar(50) (Categoría del producto)
    // created_at: timestamp (Fecha de creación)
   
    response.send(products);
});

router.post('/', (request, response) => {
    products.push(request.body);
    response.status(201).send();
});

router.put('/', (request, response) => {
    // let indexBusqueda = products.indexOf((id => products.id==id));

    let busqueda = products.filter((product => product.id==request.body.id));
    products.splice(busqueda.indexOf(0),1,request.body);
    response.status(201).send();
});

router.put('/:id', (request, response) => {
    let indeceBusqueda = products.findIndex((product => product.id==request.params.id));
    if (indeceBusqueda != -1){
        products.splice(indeceBusqueda,1,request.body);
        response.status(201).send();
    }else{
        response.status(404).send();
    }
});

router.delete('/:id', (request, response) => {
    let indeceBusqueda = products.findIndex((product => product.id==request.params.id));
    if (indeceBusqueda != -1){
        products.splice(indeceBusqueda,1);
        response.status(201).send();
    }else{
        response.status(404).send();
    }
});

module.exports = router;
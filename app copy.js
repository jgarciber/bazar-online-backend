const express = require('express');
const app = express ();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get('/status', (request, response) => {
    const status = {
        "Status": "Running"
    }
    response.send(status);
});

const products = [
    {
        "id": "1",
        "name": "producto1",
        "price": "10e",
        "stock": "12",
        "category": "categoria1",
        "created_at": "18/10/2024"
    },
    {
        "id": "2",
        "name": "producto2",
        "price": "18e",
        "stock": "20",
        "category": "categoria5",
        "created_at": "16/10/2024"
    }
]

app.get('/products', (request, response) => {
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

app.post('/products', (request, response) => {
    products.push(request.body);
    response.status(201).send();
});


appproductRouter.
app.put('/products/', (request, response) => {
    // let indexBusqueda = products.indexOf((id => products.id==id));

    let busqueda = products.filter((product => product.id==request.body.id));
    products.splice(busqueda.indexOf(0),1,request.body);
    response.status(201).send();
});

app.put('/products/:id', (request, response) => {
    let indeceBusqueda = products.findIndex((product => product.id==request.params.id));
    if (indeceBusqueda != -1){
        products.splice(indeceBusqueda,1,request.body);
        response.status(201).send();
    }else{
        response.status(404).send();
    }
});

app.delete('/products/:id', (request, response) => {
    let indeceBusqueda = products.findIndex((product => product.id==request.params.id));
    if (indeceBusqueda != -1){
        products.splice(indeceBusqueda,1);
        response.status(201).send();
    }else{
        response.status(404).send();
    }
});

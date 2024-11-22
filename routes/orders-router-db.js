const express = require('express');
const router = express.Router();
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');


router.get('/', middleware.authToken, (req, res) => {
    if(req.user.is_admin){
        if(req.query.q){
            db.obtenerBusquedaPedido((rows) => {
                res.send(rows)
            }, req.query.q)
        }else{
            db.obtenerPedidos((rows) => {
                res.send(rows)
            })
        }
    }else{
        db.obtenerPedidosUsuario((rows) => {
            res.send(rows)
        }, req.user.user_id)
    }
});

router.post('/', middleware.authToken, (request, response) => {
    // Comprobación si el usuario que realiza la compra es el mismo que se ha logueado (se podría haber cambiado en el cliente con la variable user_id)
    if(request.user.user_id != request.body.user_id) return response.sendStatus(403)
    db.insertarPedido((rows) => {
        response.status(201).send(rows)
    }, request.body);
});


module.exports = router;
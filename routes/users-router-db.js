const express = require('express');
const router = express.Router();
// const products = require('../reposories/product-repositories');
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')


router.get('/', middleware.authToken, (req, res) => {
    if(req.user.is_admin){
        if(req.query.q){
            db.obtenerBusquedaUsuario((rows) => {
                res.send(rows)
            }, req.query.q)
        }else{
            db.obtenerUsuarios((rows) => {
                res.send(rows)
            })
        }
    }else{
        db.obtenerUsuario((rows) => {
            res.send(rows)
        }, req.user.user_id)
    }
});

router.post('/', middleware.authTokenAdmin, (req, res) => {
    db.registrarUsuarioBcryptjs((err) => {
        if (err == undefined){
            // res.status(201).send();
            res.status(201).json({
                message: `Se ha registrado el usuario '${req.body.username}' correctamente`
            });
        }else{
            res.send(err);
        } 
    }, req.body.username, req.body.password, req.body.isAdmin);
});

router.put('/:id', middleware.authToken, (req, res) => {
    if(req.user.is_admin || (req.user.user_id == req.params.id)){
        db.modificarUsuario((rows) => {
            if (rows != null){
                // res.status(204).send();
                res.status(200).json({
                    message: `Se ha modificado el usuario '${req.body.username}' correctamente`
                });
            }else{
                res.status(404).send();
            }
        }, req.params.id, req.body);
    }else{
        res.status(403).send('Acción no permitida');
    }
});

router.delete('/:id', middleware.authTokenAdmin, (req, res) => {
    //Un usuario no puede borrarse a sí mismo, debe hacerlo otro usuario administrador
    if(req.user.user_id == req.params.id) return res.status(403).send('El usuario no puede borrarse a sí mismo, debe hacerlo otro usuario administrador autorizado')
    db.borrarUsuario((rows) => {
        if (rows != null){
            // res.status(204).send();
            res.status(200).json({
                message: `Se ha borrado el usuario correctamente`
            });
        }else{
            res.status(404).send();
        }
    }, req.params.id);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const DB = require('../db.js')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')

const { z } = require('zod');

// Esquema de validación de datos del usuario
const userSchema = z.object({
    username: z.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(50, "El nombre de usuario no puede superar los 50 caracteres")
        .regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, números y guiones bajos"),

    firstName: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede superar los 100 caracteres")
        .optional(),

    lastName: z.string()
        .min(3, "El apellido debe tener al menos 3 caracteres")
        .max(100, "El apellido no puede superar los 100 caracteres")
        .optional(),

    email: z.string()
        // .email("El correo electrónico no es válido")
        .min(5, "El correo electrónico debe tener al menos 5 caracteres")
        .max(100, "El correo electrónico no puede superar los 100 caracteres")
        .optional(),

    password: z.string()
        .min(6, "La contraseña debe tener al menos 6 caracteres")
        .max(50, "La contraseña no puede superar los 50 caracteres")
        .optional(),

    isAdmin: z.string()
        .refine(value => value === 'true' || value === 'false', {
            message: "El campo 'isAdmin' debe ser 'true' o 'false'"
        })
        .transform(value => value === 'true'),  // Transforma 'true'/'false' a booleano

    isActive: z.string()
        .refine(value => value === 'true' || value === 'false', {
            message: "El campo 'isActive' debe ser 'true' o 'false'"
        })
        .transform(value => value === 'true') // Transforma 'true'/'false' a booleano
});

const idSchema = z.object({
    id: z.string().refine(value => !isNaN(Number(value)) && Number(value) > 0, {
        message: "El ID debe ser un número mayor que 0 y válido"
    })
});

// Contiene la información de los usuarios del sistema.
// Campos: ‘id’ (clave primaria), ‘username’, ‘password’, ‘is_admin’, ‘first_name’, ‘last_name’, ‘email’, ‘is_active’.
// Relación: Los usuarios están asociados con ‘orders’ y ‘sales’. Si un usuario es eliminado, los registros asociados 
// en ‘orders’ y ‘sales’ mantienen la relación con NULL.

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

// router.post('/', middleware.authTokenAdmin, (req, res) => {
//     db.registrarUsuarioBcryptjs((err) => {
//         if (err == undefined){
//             // res.status(201).send();
//             res.status(201).json({
//                 message: `Se ha registrado el usuario '${req.body.username}' correctamente`
//             });
//         }else{
//             res.send(err);
//         } 
//     }, req.body);
// });

router.post('/', async (req, res) => {
    try {
        // Validar los datos del usuario usando Zod
        const validatedUser = userSchema.parse(req.body); // Validación con el esquema Zod

        // Verificar si el nombre de usuario ya existe
        const nombreUsuario = validatedUser.username;
        const nombreUsuarioExiste = await db.verificarNombreUsuarioExiste(nombreUsuario);

        if (nombreUsuarioExiste) {
            return res.status(400).json({
                errors: [
                    {message: `El nombre de usuario '${nombreUsuario}' ya está en uso`}
                ]
            });
        }

        // Llamada a la función que registra el usuario, ahora con los datos validados
        db.registrarUsuarioBcryptjs((err) => {
            if (err == undefined) {
                res.status(201).json({
                    message: `Se ha registrado el usuario '${validatedUser.username}' correctamente`
                });
            } else {
                res.status(400).json({
                    message: `No se pudo registrar al usuario '${validatedUser.username}'`
                });
            }
        }, validatedUser);

    } catch (error) {
        // Si la validación falla, responder con los errores de Zod
        res.status(400).json({
            message: "Error de validación de datos",
            errors: error.errors // Los detalles de los errores de validación
        });
    }
});

// router.put('/:id', middleware.authToken, (req, res) => {
//     if(req.user.is_admin || (req.user.user_id == req.params.id)){
//         db.modificarUsuario((rows) => {
//             if (rows != null){
//                 // res.status(204).send();
//                 res.status(200).json({
//                     message: `Se ha modificado el usuario '${req.body.username}' correctamente`
//                 });
//             }else{
//                 res.status(404).send();
//             }
//         }, req.params.id, req.body);
//     }else{
//         res.status(403).send('Acción no permitida');
//     }
// });

router.put('/:id', middleware.authToken, async (req, res) => {
    try {
        // Validar el ID de la URL
        const { id } = idSchema.parse(req.params); // Validamos el id en la URL usando Zod

        // Validar los datos del usuario a modificar
        const validatedUser = userSchema.parse(req.body);

        // Verificar si el nombre de usuario ya está en uso por otro usuario
        const nombreUsuarioExiste = await db.verificarNombreUsuarioExiste(validatedUser.username, id);

        if (nombreUsuarioExiste) {
            return res.status(400).json({
                message: `El nombre de usuario '${validatedUser.username}' ya está en uso por otro usuario`
            });
        }

        // Comprobamos que el usuario tiene permisos para modificar
        if (req.user.is_admin || (req.user.user_id == req.params.id)) {
            db.modificarUsuario((rows) => {
                if (rows != null) {
                    res.status(200).json({
                        message: `Se ha modificado el usuario '${validatedUser.username}' correctamente`
                    });
                } else {
                    res.status(404).send();
                }
            }, id, validatedUser);
        } else {
            res.status(403).send('Acción no permitida');
        }
    } catch (error) {
        // Si hay errores de validación
        res.status(400).json({
            message: "Error de validación de datos",
            errors: error.errors
        });
    }
});

// router.delete('/:id', middleware.authTokenAdmin, (req, res) => {
//     //Un usuario no puede borrarse a sí mismo, debe hacerlo otro usuario administrador
//     if(req.user.user_id == req.params.id){
//         return res.status(403).send('El usuario no puede borrarse a sí mismo, debe hacerlo otro usuario administrador autorizado')
//     }
//     db.borrarUsuario((rows) => {
//         if (rows != null){
//             // res.status(204).send();
//             res.status(200).json({
//                 message: `Se ha borrado el usuario correctamente`
//             });
//         }else{
//             res.status(404).send();
//         }
//     }, req.params.id);
// });

router.delete('/:id', middleware.authTokenAdmin, (req, res) => {
    try {
        // Validar el ID de la URL
        const { id } = idSchema.parse(req.params); // Validamos el id en la URL usando Zod

        if (req.user.user_id == req.params.id) {
            return res.status(403).send('El usuario no puede borrarse a sí mismo, debe hacerlo otro usuario administrador autorizado');
        }

        db.borrarUsuario((rows) => {
            if (rows != null) {
                res.status(200).json({
                    message: `Se ha borrado el usuario correctamente`
                });
            } else {
                res.status(404).send();
            }
        }, id);
    } catch (error) {
        // Si hay errores de validación
        res.status(400).json({
            message: "Error de validación de datos",
            errors: error.errors
        });
    }
});

module.exports = router;
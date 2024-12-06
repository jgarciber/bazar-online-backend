const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');

const { z } = require('zod');

// Esquema de validación del producto y la venta
const productoSchema = z.object({
    id: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value > 0, "El ID del producto debe ser un número válido y mayor a 0"),
    name: z.string().min(3, "El nombre del producto debe tener al menos 3 caracteres"),
    price: z.string().transform(value => parseFloat(value)).refine(value => !isNaN(value) && value > 0, "El precio debe ser un número mayor a 0"),
    stock: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value >= 0, "El stock debe ser un número entero no negativo"),
    quantity: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value > 0, "La cantidad debe ser un número entero mayor que 0"),
});

const ventaSchema = z.object({
    product: productoSchema, // Validamos los datos del producto
    order: z.object({
        user_id: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value > 0, "El ID del usuario debe ser un número válido y mayor a 0"),
        order_id: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value > 0, "El ID del pedido debe ser un número válido y mayor a 0"),
    })
});

// Registra las ventas de productos realizadas a través de pedidos.
// Campos: ‘id’ (clave primaria), ‘product_id’ (clave foránea de ‘products’), ‘user_id’ (clave foránea de ‘users’), 
// ‘order_id’ (clave foránea de ‘orders’), ‘quantity’, ‘total’, ‘sale_date’.
// Relación: Se asocia con ‘products’, ‘users’ y ‘orders’ a través de las claves foráneas correspondientes. 
// Si un producto, usuario o pedido se elimina, la relación se actualiza a NULL.

router.get('/', middleware.authToken, (request, response) => {
    if(request.user.is_admin){
        if(request.query.q){
            db.obtenerBusquedaVentas((rows) => {
                response.send(rows)
            }, request.query.q, request.query.type, request.query.startDate, request.query.endDate)
        }else{
            db.obtenerVentasCompleto((rows) => {
                response.send(rows)
            })
        }
    }else{
        db.obtenerVentasUsuario((rows) => {
            response.send(rows)
        }, request.user.user_id)
    }
});

router.post('/', middleware.authToken, async (request, response) => {
    try {
        // Validar el cuerpo de la solicitud
        const ventaValida = ventaSchema.parse(request.body);

        // Verificar que el usuario que realiza la compra sea el mismo que está logueado
        if (request.user.user_id !== ventaValida.order.user_id) {
            return response.status(403).json({ message: "No tienes permisos para realizar esta compra" });
        }

        // Verificar que el producto existe
        const productoExiste = await db.verificarProductoExiste(ventaValida.product.id);
        if (!productoExiste) {
            return response.status(404).json({ message: "Producto no encontrado" });
        }

        // Verificar si el pedido existe 
        const pedidoExiste = await db.verificarPedidoExiste(ventaValida.order.order_id);
        if (!pedidoExiste) {
            return response.status(404).json({ message: "Pedido no encontrado" });
        }

        // Verificar si el usuario existe
        const usuarioExiste = await db.verificarUsuarioExiste(ventaValida.order.user_id);
        if (!usuarioExiste) {
            return response.status(404).json({ message: "Usuario no encontrado" });
        }

        // Realizar la inserción de la venta en la base de datos
        db.insertarVenta((rows) => {
            response.status(201).json({
                message: "Venta registrada con éxito",
                // sale_id: rows.insertId
            });
        }, ventaValida.product, ventaValida.order);

    } catch (error) {
        // Si ocurre un error en la validación, devolvemos un mensaje de error
        response.status(400).json({
            message: "Datos inválidos",
            errors: error.errors
        });
    }
});
module.exports = router;
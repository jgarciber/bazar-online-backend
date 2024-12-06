const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js');

const { z } = require('zod');

// Esquema actualizado con transformación y validación para los campos de producto
const productoSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),

  // Precio: Convertir a número flotante y validar que sea mayor a 0
  price: z.string()
    .transform(value => parseFloat(value))  // Convierte el string a número flotante
    .refine(value => !isNaN(value) && value > 0, "El precio debe ser un número mayor a 0"),

  // Stock: Convertir a número entero y validar que sea mayor o igual a 0
  stock: z.string()
    .transform(value => parseInt(value, 10))  // Convierte el string a número entero
    .refine(value => !isNaN(value) && value >= 0, "El stock debe ser un número entero no negativo"),

  // Categoría: Convertir a número entero y validar que sea mayor a 0
  category: z.string()
    .transform(value => parseInt(value, 10))  // Convierte el string a número entero
    .refine(value => !isNaN(value) && value > 0, "La categoría debe ser un ID válido mayor a 0")
});


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

router.post('/', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Validar los datos con Zod
        const producto = productoSchema.parse(request.body); // Si los datos no son válidos, Zod lanzará un error

        // Validar que el nombre del producto sea único
        const nombreProducto = producto.name;
        const NombreProductoExiste = await db.verificarNombreProductoExiste(nombreProducto);

        if (NombreProductoExiste) {
            return response.status(400).json({
                message: `El producto con el nombre '${nombreProducto}' ya existe.`
            });
        }

        // Ahora validamos si el ID de la categoría existe en la base de datos
        const categoriaId = producto.category;
        const categoriaExiste = await db.verificarCategoriaExiste(categoriaId);

        if (!categoriaExiste) {
            return response.status(404).json({
                message: `La categoría con ID ${categoriaId} no existe.`
            });
        }

        // Si la validación pasa, proceder a insertar el producto
        db.insertarProducto((rows) => {
            response.status(201).json({
                message: `Se ha añadido el producto '${producto.name}' correctamente`
            });
        }, producto);

    } catch (error) {
        // Si la validación falla, enviar un mensaje de error
        response.status(400).json({
            message: "Datos del producto inválidos",
            errors: error.errors // Los errores generados por Zod
        });
    }
});

router.put('/:id', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Validar los datos del producto con Zod
        const producto = productoSchema.parse(request.body); // Si los datos no son válidos, Zod lanzará un error

        // Verificar si el producto existe
        const productoId = request.params.id;
        const productoExiste = await db.verificarProductoExiste(productoId);

        if (!productoExiste) {
            return response.status(404).json({
                message: `El producto con ID ${productoId} no existe.`
            });
        }

        // Verificar si el nombre del producto ya está en uso por otro producto
        const nombreProducto = producto.name;
        const NombreProductoExiste = await db.verificarNombreProductoExiste(nombreProducto, productoId);

        if (NombreProductoExiste) {
            return response.status(400).json({
                message: `El producto con el nombre '${nombreProducto}' ya existe.`
            });
        }

        // Verificar si la categoría existe
        const categoriaId = producto.category;
        const categoriaExiste = await db.verificarCategoriaExiste(categoriaId);

        if (!categoriaExiste) {
            return response.status(404).json({
                message: `La categoría con ID ${categoriaId} no existe.`
            });
        }

        // Si todo es válido, modificar el producto
        db.modificarProducto((rows) => {
            if (rows != null) {
                response.status(200).json({
                    message: `Se ha modificado el producto '${producto.name}' correctamente`
                });
            } else {
                response.status(404).send();
            }
        }, productoId, producto);

    } catch (error) {
        // Si la validación falla, enviar un mensaje de error
        response.status(400).json({
            message: "Datos del producto inválidos",
            errors: error.errors // Los errores generados por Zod
        });
    }
});

router.delete('/:id', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Verificar si el producto existe
        const productoId = request.params.id;
        const productoExiste = await db.verificarProductoExiste(productoId);

        if (!productoExiste) {
            return response.status(404).json({
                message: `El producto con ID ${productoId} no existe.`
            });
        }

        // Si el producto existe, proceder a borrarlo
        db.borrarProducto((rows) => {
            if (rows != null) {
                response.status(200).json({
                    message: `Se ha borrado el producto correctamente.`
                });
            } else {
                response.status(404).send();
            }
        }, productoId);

    } catch (error) {
        // Manejo de errores generales (si los hay)
        response.status(500).json({
            message: "Hubo un problema al intentar eliminar el producto.",
            error: error.message
        });
    }
});

module.exports = router;
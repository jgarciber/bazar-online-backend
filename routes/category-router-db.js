const express = require('express');
const router = express.Router();
const DB = require('../db')
const db = new DB ('localhost', 'root', '');
const middleware = require('../middleware.js')

const { z } = require('zod');

// Esquema para crear o modificar una categoría
const categoriaSchema = z.object({
  name: z.string().min(3, "El nombre de la categoría debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres")
});

// Esquema para validar el ID de la categoría (por ejemplo, al modificar o borrar)
const categoriaIdSchema = z.object({
    id: z.string().transform(value => parseInt(value, 10)).refine(value => !isNaN(value) && value > 0, "El ID de la categoría debe ser un número válido mayor a 0")
});

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

router.post('/', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Validar los datos de la categoría usando Zod
        const categoriaValida = categoriaSchema.parse(request.body);

        // Verificar si el nombre de la categoría ya existe
        const nombreCategoria = categoriaValida.name;
        const nombreCategoriaExiste = await db.verificarNombreCategoriaExiste(nombreCategoria);

        if (nombreCategoriaExiste) {
            return response.status(400).json({
                message: `La categoría con el nombre '${nombreCategoria}' ya existe.`
            });
        }

        // Si el nombre no está repetido, insertamos la categoría en la base de datos
        db.insertarCategoria((rows) => {
            response.status(201).json({
                message: `Se ha añadido la categoría '${categoriaValida.name}' correctamente`
            });
        }, categoriaValida);

    } catch (error) {
        // Si la validación falla, respondemos con un error
        response.status(400).json({
            message: "Datos de la categoría inválidos",
            errors: error.errors
        });
    }
});

router.put('/:id', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Validar el ID de la categoría con Zod
        const { id } = categoriaIdSchema.parse(request.params);

        // Verificar si la categoría existe
        const categoriaExiste = await db.verificarCategoriaExiste(id);
        if (!categoriaExiste) {
            return response.status(404).json({ message: "Categoría no encontrada" });
        }

        // Validar los datos de la categoría
        const categoriaValida = categoriaSchema.parse(request.body);

        // Verificar si el nuevo nombre de la categoría ya existe
        const nombreCategoria = categoriaValida.name;
        const nombreCategoriaExiste = await db.verificarNombreCategoriaExiste(nombreCategoria, id);

        if (nombreCategoriaExiste) {
            return response.status(400).json({
                message: `Ya existe una categoría con el nombre '${nombreCategoria}'`
            });
        }

        // Llamada a la función para modificar la categoría en la base de datos
        db.modificarCategoria((rows) => {
            response.status(200).json({
                message: `Se ha modificado la categoría '${categoriaValida.name}' correctamente`
            });
        }, id, categoriaValida);

    } catch (error) {
        // Si la validación falla, respondemos con un error
        response.status(400).json({
            message: "Datos inválidos",
            errors: error.errors
        });
    }
});

router.delete('/:id', middleware.authTokenAdmin, async (request, response) => {
    try {
        // Validar el ID de la categoría
        const { id } = categoriaIdSchema.parse(request.params);

        // Verificar si la categoría existe
        const categoriaExiste = await db.verificarCategoriaExiste(id);
        if (!categoriaExiste) {
            return response.status(404).json({ message: "Categoría no encontrada" });
        }

        // Llamada a la función para borrar la categoría en la base de datos
        db.borrarCategoria((rows) => {
            response.status(200).json({
                message: 'Se ha borrado la categoría correctamente'
            });
        }, id);

    } catch (error) {
        // Si la validación falla, respondemos con un error
        response.status(400).json({
            message: "Datos inválidos",
            errors: error.errors
        });
    }
});

module.exports = router;
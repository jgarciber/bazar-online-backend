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


// Esquema para validar el cart y user_id
const checkoutSchema = z.object({
    user_id: z.string().transform((val) => {
        const userId = parseInt(val, 10); // Convertir a número
        if (isNaN(userId) || userId <= 0) {
            throw new Error('El user_id debe ser un número mayor que 0');
        }
        return userId;
    }),
    
    cart: z.array(
        z.object({
            product_id: z.string().transform((val) => {
            const productId = parseInt(val, 10); // Convertir a número
            if (isNaN(productId) || productId <= 0) {
                throw new Error('El product_id debe ser un número mayor que 0');
            }
            return productId;
            }),
            
            quantity: z.string().transform((val) => {
            const quantity = parseInt(val, 10); // Convertir quantity a número
            if (isNaN(quantity) || quantity < 1) {
                throw new Error('La cantidad debe ser un número entero mayor o igual a 1');
            }
            return quantity;
            }),
        })
        ).min(1, 'El carrito debe contener al menos un producto'), // El carrito no puede estar vacío
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

router.post('/checkout', middleware.authToken, async (req, res) => {
    const { user_id, cart } = req.body;
  
    try {
        // Validar los datos utilizando Zod
        checkoutSchema.parse({ user_id, cart });
    
        // Verificar que el usuario que realiza la compra sea el mismo que está logueado
        if (req.user.user_id != user_id) {
            return res.status(403).json({ error: "No tienes permisos para realizar esta compra" });
        }
    
        // Llamada a la función checkout del archivo db.js
        const result = await db.checkout(user_id, cart);
    
        if (result.status === 'error') {
            // Si ocurre un error, devolvemos un mensaje de error y un código 400
            return res.status(400).json({ error: result.message });
        }
    
        // Si todo salió bien, devolvemos la respuesta con el ID del pedido y el total
        return res.status(200).json({
            message: 'Compra realizada correctamente',
            orderId: result.orderId,
            totalFinal: result.totalFinal,
            itemsFactura: result.itemsFactura,
        });
  
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Si hay un error de validación, devolvemos un código 400 con los detalles del error
            return res.status(400).json({ error: err.errors });
        }
        // Si ocurre otro tipo de error
        console.log('Error al procesar la compra:', err);
        return res.status(500).json({ error: 'Hubo un error al procesar la compra' });
    }
});

module.exports = router;
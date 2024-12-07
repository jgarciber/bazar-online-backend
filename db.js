const bcryptjs = require('bcryptjs');
// const dotenv = require('dotenv');
// dotenv.config();
class DB{
    constructor(host, user, password){
        this.host = host;
        this.user = user;
        this.password = password;
    }

    get host(){
        return this._host;
    }
    set host(host){
        this._host = host;
    }

    get user(){
        return this. user;
    }
    set user(user){
        this._user = user;
    }

    get password(){
        return this. password;
    }
    set password(password){
        this._password = password;
    }

    createMySQLConnection(){
        const mysql      = require('mysql2');
        var connection = mysql.createConnection({
            host     : process.env.MYSQL_HOST,
            user     : process.env.MYSQL_ROOT_USERNAME,
            password : process.env.MYSQL_ROOT_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        return connection;
    };

    openConnection(connection){
        connection.connect();
    }

    static closeConnection(connection){
        connection.end();
    }

    loginUsuario(callback, name, password){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT us.id, us.username, us.is_admin FROM users as us WHERE us.username="${name}" and us.password="${password}"`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    }

    loginUsuarioBcryptjs(callback, name, password){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT us.password FROM users as us WHERE us.username="${name}"`, function(err, rows, fields) {
            if (err) throw err;
            if (rows.length == 1){
                // bcryptjs.compare(userInputPassword, storedHashedPassword, (err, result) => {
                bcryptjs.compare(password, rows[0].password, (err, result) => {
                    if (err) {
                        // Handle error
                        console.error('Error comparing passwords:', err);
                        return callback([], undefined);
                    }
                    if (result) {
                        // Passwords match, authentication successful
                        console.log('Passwords match! User authenticated.');
                        conexion.query(`SELECT us.id, us.username, us.is_admin, us.is_active FROM users as us WHERE us.username="${name}"`, function(err, rows, fields) {
                                if (err) throw err;
                                // DB.closeConnection(conexion)
                                if (rows[0].is_active == 0){
                                    let errorInactiveUser = 'El usuario se encuentra inactivo, por favor contacte con un usuario administrador para reactiva su cuenta'
                                    return callback([], errorInactiveUser);
                                }else{
                                    return callback(rows, undefined);
                                }
                            }
                        );
                    } else {
                        // Passwords don't match, authentication failed
                        console.log('Passwords do not match! Authentication failed.');
                        let errorPassworsDoNotMatch = 'La contraseña es incorrecta, por favor inténtelo otra vez'
                        return callback([], errorPassworsDoNotMatch);
                    }
                     // DB.closeConnection(conexion);
                })
            }else{
                // DB.closeConnection(conexion);
                let errorUserNotFound = 'No se ha encontrado a dicho usuario, por favor inténtelo otra vez'
                return callback([], errorUserNotFound);
            }
        });
    }

    obtenerUsuarios(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT id, first_name as firstName, last_name as lastName, email, username, is_admin as isAdmin, is_active as isActive FROM users`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    }

    obtenerUsuario(callback, userId){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT id, first_name as firstName, last_name as lastName, email, username, is_admin as isAdmin, is_active as isActive FROM users WHERE id='${userId}'`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    }

    async registrarUsuario(callback, name, password){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`INSERT INTO users (username, password) VALUES ("${name}", "${password}")`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    }

    async registrarUsuarioBcryptjs(callback, newUser, isAdmin = 0, isActive = 1) {
        try {
            // Encriptar la contraseña
            let passwordCrypt = await bcryptjs.hash(newUser.password, Number(process.env.BCRYPT_SALT_ROUNDS));
    
            // Asegurarse de que isAdmin e isActive sean valores binarios (0 o 1)
            isAdmin = isAdmin ? 1 : 0;
            isActive = isActive ? 1 : 0;
    
            // Conexión a la base de datos
            const conexion = this.createMySQLConnection();
            this.openConnection(conexion);
    
            // Consulta para insertar el nuevo usuario
            conexion.query(
                `INSERT INTO users (username, first_name, last_name, email, password, is_admin, is_active) 
                VALUES ("${newUser.username}", "${newUser.firstName}", "${newUser.lastName}", "${newUser.email}", "${passwordCrypt}", "${isAdmin}", "${isActive}")`,
                function (err, rows, fields) {
                    if (err) {
                        callback(err); // Si ocurre un error al insertar, lo devolvemos
                    } else {
                        callback(undefined); // Sin error, indicamos éxito
                    }
                }
            );
            // Cerrar la conexión
            DB.closeConnection(conexion);
    
        } catch (error) {
            callback(error); // Si ocurre un error inesperado, lo devolvemos
        }
    }
    
    obtenerProducto(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM products as p WHERE p.id = "${id}"`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerProductos(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT p.id, p.name, p.price, p.stock, c.name as categoryName, c.id as categoryId FROM products p INNER JOIN categories c ON c.id=p.category`, function(err, rows, fields) {
            // console.log('Estoy en el callback');
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
        // console.log('E ignorado el callback');
    };

    obtenerBusquedaProductos(callback, searchKeyWord){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT p.id, p.name, p.price, p.stock, c.name as categoryName, c.id as categoryId FROM products p INNER JOIN categories c ON c.id=p.category WHERE p.name LIKE '%${searchKeyWord}%'`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerBusquedaProductosPorCategoria(callback, categoryId){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT p.id, p.name, p.price, p.stock, c.name as categoryName, c.id as categoryId FROM products p INNER JOIN categories c ON c.id=p.category WHERE c.id=${categoryId}`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerBusquedaUsuario(callback, searchKeyWord){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT id, first_name as firstName, last_name as lastName, email, username, is_admin as isAdmin, is_active as isActive FROM users WHERE username LIKE '%${searchKeyWord}%'`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerVentas(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM sales`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerVentasCompleto(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT p.id as id, s.order_id as order_id, p.name as name, cat.name as category, p.price as price, s.quantity as quantity, s.total as total, s.sale_date as sale_date, us.username as username FROM sales s LEFT JOIN products p ON p.id=s.product_id LEFT JOIN users us ON us.id=s.user_id LEFT JOIN categories cat ON cat.id=p.category ORDER BY s.sale_date DESC`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerVentasUsuario(callback, userId){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT p.id as id, s.order_id as order_id, p.name as name, cat.name as category, p.price as price, s.quantity as quantity, s.total as total, s.sale_date as sale_date, us.username as username FROM sales s LEFT JOIN products p ON p.id=s.product_id LEFT JOIN users us ON us.id=s.user_id LEFT JOIN categories cat ON cat.id=p.category WHERE us.id='${userId}' ORDER BY s.sale_date DESC`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerBusquedaVentas(callback, query, type, startDate, endDate){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        let busquedaPorUsuario = (query != 'undefined') ? `WHERE us.username LIKE '%${query}%'` : '';
        let busquedaPorPedido = (query != 'undefined') ? `WHERE s.order_id LIKE '%${query}%'` : '';
        let busquedaPorProducto = (query != 'undefined') ? `WHERE p.name LIKE '%${query}%'` : '';
        let busquedaPorCategoria = (query != 'undefined') ? `WHERE cat.name LIKE '%${query}%'` : '';
        //para que se busque hasta endDate como el último día completo, hay que añadirlo manualmente, ya que el cliente envía las fechas en formato yyyy/mm/dd
        let busquedaPorFecha = `WHERE s.sale_date >= TIMESTAMP('${startDate} 00:00:00') AND s.sale_date <= TIMESTAMP('${endDate} 23:59:59')`;
        if (busquedaPorUsuario || busquedaPorPedido || busquedaPorProducto || busquedaPorCategoria){
            busquedaPorFecha = ` AND s.sale_date >= TIMESTAMP('${startDate} 00:00:00') AND s.sale_date <= TIMESTAMP('${endDate} 23:59:59')`;
        }
        if(startDate == '1970/01/01') busquedaPorFecha=''

        let cadenaPrincipal = `SELECT p.id as id, p.name as name, s.order_id as order_id, cat.name as category, p.price as price, s.quantity as quantity, s.total as total, s.sale_date as sale_date, us.username as username FROM sales s LEFT JOIN products p ON p.id=s.product_id LEFT JOIN users us ON us.id=s.user_id LEFT JOIN categories cat ON cat.id=p.category `;

        let finalCadena = ` ORDER BY s.sale_date DESC`;

        let cadenaCompleta = '';
        switch(type){
            case 'user':
                cadenaCompleta += cadenaPrincipal + busquedaPorUsuario + busquedaPorFecha + finalCadena;
                break;
            case 'order':
                cadenaCompleta += cadenaPrincipal + busquedaPorPedido + busquedaPorFecha + finalCadena;
                break;
            case 'product':
                cadenaCompleta += cadenaPrincipal + busquedaPorProducto + busquedaPorFecha + finalCadena;
                break;
            case 'category':
                cadenaCompleta += cadenaPrincipal + busquedaPorCategoria + busquedaPorFecha + finalCadena;
                break;
            default:
                cadenaCompleta += cadenaPrincipal + finalCadena;
                break;
        }
        conexion.query(cadenaCompleta, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };
    
    obtenerCategorias(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM categories`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    insertarProducto(callback, producto){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`INSERT INTO products (name, price, stock, category) VALUES ('${producto.name}', ${producto.price}, ${producto.stock}, '${producto.category}') `, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    insertarVenta(callback, producto, pedido){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        let total = producto.price * producto.quantity;
        let newStock = producto.stock - producto.quantity;
        conexion.query(`UPDATE products SET stock='${newStock}' WHERE id = ${producto.id}`, function(err, rows, fields) {
            if (err) throw err;
        });
        conexion.query(`INSERT INTO sales (product_id, quantity, total, user_id, order_id) VALUES ('${producto.id}', '${producto.quantity}', '${total}', '${pedido.user_id}', '${pedido.order_id}') `, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    insertarCategoria(callback, categoria){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`INSERT INTO categories (name, description) VALUES ('${categoria.name}', '${categoria.description}') `, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    obtenerPedidos(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT o.id, us.username, o.total_articles, o.subtotal, o.discount, o.calculated_discount, o.subtotal_with_discount, o.taxes, o.calculated_taxes, o.total FROM orders o INNER JOIN users us ON us.id=o.user_id ORDER BY o.id DESC`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerPedidosUsuario(callback, userId){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT o.id, us.username, o.total_articles, o.subtotal, o.discount, o.calculated_discount, o.subtotal_with_discount, o.taxes, o.calculated_taxes, o.total FROM orders o INNER JOIN users us ON us.id=o.user_id WHERE user_id='${userId}' ORDER BY o.id DESC`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerBusquedaPedido(callback, searchKeyWord){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT o.id, us.username, o.total_articles, o.subtotal, o.discount, o.calculated_discount, o.subtotal_with_discount, o.taxes, o.calculated_taxes, o.total FROM orders o INNER JOIN users us ON us.id=o.user_id WHERE o.id LIKE '%${searchKeyWord}%' ORDER BY o.id DESC`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    insertarPedido(callback, pedido){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`INSERT INTO orders (user_id, total_articles, subtotal, discount, calculated_discount, subtotal_with_discount, taxes, calculated_taxes, total) VALUES ('${pedido.user_id}', '${pedido.total_articulos}', '${pedido.subtotal}', '${pedido.descuento}', '${pedido.descuentoTotal}', '${pedido.subtotalConDescuento}', '${pedido.impuesto}', '${pedido.impuestos}', '${pedido.totalFinal}') `, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    borrarProducto(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`DELETE FROM products WHERE id = "${id}"`, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    borrarCategoria(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`DELETE FROM categories WHERE id = "${id}"`, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    borrarUsuario(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`DELETE FROM users WHERE id = "${id}"`, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    modificarProducto(callback, id, producto){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`UPDATE products SET name='${producto.name}', price='${producto.price}', stock='${producto.stock}', category='${producto.category}' WHERE id = ${id}`, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    modificarCategoria(callback, id, categoria){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`UPDATE categories SET name='${categoria.name}', description='${categoria.description}' WHERE id = ${id}`, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    async modificarUsuario(callback, id, usuario){
        let isAdmin = usuario.isAdmin ? 1 : 0;
        let isActive = usuario.isActive ? 1 : 0;
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        let consulta = '';
        let setFirstName = (usuario.firstName != undefined) ? ` first_name='${usuario.firstName}',` : '';
        let setLastName = (usuario.lastName != undefined) ?  ` last_name='${usuario.lastName}',` : '';
        let setEmail = (usuario.email != undefined) ?  ` email='${usuario.email}',` : '';
        if(usuario.password == undefined){
            consulta = 'UPDATE users SET' + setFirstName + setLastName + setEmail + ` is_admin='${isAdmin}', is_active='${isActive}' WHERE id = ${id}`;
        }else{
            let passwordCrypt = await bcryptjs.hash(usuario.password, Number(process.env.BCRYPT_SALT_ROUNDS))
            consulta = 'UPDATE users SET' + setFirstName + setLastName + setEmail + ` password='${passwordCrypt}', is_admin='${isAdmin}', is_active='${isActive}' WHERE id = '${id}'`;
        }
        conexion.query(consulta, function(err, rows, fields) {
          if (err) throw err;
          callback(rows);
          DB.closeConnection(conexion);
        });
    };

    async verificarCategoriaExiste(categoriaId) {
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
    
        return new Promise((resolve, reject) => {
            conexion.query('SELECT id FROM categories WHERE id = ?', [categoriaId], (err, results) => {
                try{
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length > 0);  // Si hay resultados, la categoría existe
                    }
                } finally {
                    DB.closeConnection(conexion); // Cerramos la conexión siempre, independientemente de lo que suceda
                }
            });
        });
    }

    // Función para verificar si el nombre de la categoría ya existe, excluyendo el ID actual
    verificarNombreCategoriaExiste(nombreCategoria, categoriaId = 0) {
        return new Promise((resolve, reject) => {
            const conexion = this.createMySQLConnection();
            this.openConnection(conexion);

            // Verificamos si el nombre de la categoría ya existe, pero excluimos el ID actual
            conexion.query(
                'SELECT COUNT(*) AS count FROM categories WHERE name = ? AND id != ?',
                [nombreCategoria, categoriaId],
                (err, results) => {
                    try {
                        if (err) {
                            reject(err); // Si ocurre un error en la consulta, lo rechazamos
                        } else {
                            const existe = results[0].count > 0; // Si el conteo es mayor que 0, la categoría ya existe
                            resolve(existe); // Resolvemos el valor booleano indicando si existe o no
                        }
                    } finally {
                        DB.closeConnection(conexion); // Cerramos la conexión siempre
                    }
                }
            );
        });
    }

    async verificarProductoExiste(productoId) {
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
    
        return new Promise((resolve, reject) => {
            conexion.query('SELECT COUNT(*) AS count FROM products WHERE id = ?', [productoId], (err, results) => {
                try{
                    if (err) {
                        reject(err); // Si ocurre un error, rechazamos la promesa
                    } else {
                        const existe = results[0].count > 0;
                        resolve(existe); // Si el conteo es mayor que 0, el producto existe
                    }
                } finally {
                    DB.closeConnection(conexion); // Cerramos la conexión siempre, independientemente de lo que suceda
                }
            });
        });
    }

    // Función para verificar si el nombre del producto ya existe, excluyendo el ID actual
    verificarNombreProductoExiste(nombreProducto, productoId = 0) {
        return new Promise((resolve, reject) => {
            const conexion = this.createMySQLConnection();
            this.openConnection(conexion);

            // Verificamos si el nombre del producto ya existe, pero excluimos el ID actual
            conexion.query(
                'SELECT COUNT(*) AS count FROM products WHERE name = ? AND id != ?',
                [nombreProducto, productoId],
                (err, results) => {
                    try {
                        if (err) {
                            reject(err); // Si ocurre un error en la consulta, lo rechazamos
                        } else {
                            const existe = results[0].count > 0; // Si el conteo es mayor que 0, el producto ya existe con otro ID
                            resolve(existe); // Resolvemos el valor booleano indicando si existe o no
                        }
                    } finally {
                        DB.closeConnection(conexion); // Cerramos la conexión siempre
                    }
                }
            );
        });
    }


    async verificarUsuarioExiste(userId) {
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
    
        return new Promise((resolve, reject) => {
            conexion.query('SELECT COUNT(*) AS count FROM users WHERE id = ?', [userId], (err, results) => {
                try{
                    if (err) {
                        reject(err); // Si ocurre un error en la consulta, lo rechazamos
                    } else {
                        resolve(results[0].count > 0); // Si el conteo es mayor que 0, el usuario existe
                    }
                } finally {
                    DB.closeConnection(conexion); // Cerramos la conexión siempre, independientemente de lo que suceda
                }
            });
        });
    }

    // Función para verificar si el nombre de usuario ya existe, excluyendo el ID actual
    verificarNombreUsuarioExiste(nombreUsuario, usuarioId = 0) {
        return new Promise((resolve, reject) => {
            const conexion = this.createMySQLConnection();
            this.openConnection(conexion);

            // Verificamos si el nombre de usuario ya existe, pero excluimos el ID actual
            conexion.query(
                'SELECT COUNT(*) AS count FROM users WHERE username = ? AND id != ?',
                [nombreUsuario, usuarioId],
                (err, results) => {
                    try {
                        if (err) {
                            reject(err); // Si ocurre un error en la consulta, lo rechazamos
                        } else {
                            const existe = results[0].count > 0; // Si el conteo es mayor que 0, el nombre de usuario ya está en uso
                            resolve(existe); // Resolvemos el valor booleano indicando si existe o no
                        }
                    } finally {
                        DB.closeConnection(conexion); // Cerramos la conexión siempre
                    }
                }
            );
        });
    }

    async verificarPedidoExiste(orderId) {
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
    
        return new Promise((resolve, reject) => {
            conexion.query('SELECT COUNT(*) AS count FROM orders WHERE id = ?', [orderId], (err, results) => {
                try{
                    if (err) {
                        reject(err); // Si ocurre un error en la consulta, lo rechazamos
                    } else {
                        resolve(results[0].count > 0); // Si el conteo es mayor que 0, el pedido existe
                    }
                } finally {
                    DB.closeConnection(conexion); // Cerramos la conexión siempre, independientemente de lo que suceda
                }
            });
        });
    }


    // Iniciar una transacción
    async startTransaction() {
        const connection = this.createMySQLConnection();
        connection.connect();
        await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
                if (err) {
                reject(err);
                } else {
                resolve(connection);
                }
            });
        });
        return connection;
    }

    // Confirmar la transacción
    async commitTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.commit((err) => {
                if (err) {
                reject(err);
                } else {
                resolve();
                }
            });
        });
    }

    // Revertir la transacción
    async rollbackTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.rollback(() => {
                resolve();
            });
        });
    }

    // Obtener un producto por ID
    async getProductById(product_id, connection) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM products WHERE id = ?',
                [product_id],
                (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
                }
            );
        });
    }

    // Insertar un pedido
    async createOrder(user_id, totalFinal, itemsFactura, descuento, descuentoTotal, IVA, impuestos, connection) {
        return new Promise((resolve, reject) => {
            const totalArticulos = itemsFactura.reduce((acc, item) => acc + item.quantity, 0);
            const subtotal = itemsFactura.reduce((acc, item) => acc + item.subtotal, 0);
            const subtotalConDescuento = subtotal - descuentoTotal;
            
            const query = `
                INSERT INTO orders 
                (user_id, total_articles, subtotal, discount, calculated_discount, subtotal_with_discount, taxes, calculated_taxes, total) 
                VALUES 
                (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(
                query,
                [user_id, totalArticulos, subtotal, descuento, descuentoTotal, subtotalConDescuento, IVA, impuestos, totalFinal],
                (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.insertId); // Devuelve el ID del pedido insertado
                }
                }
            );
        });
    }

    // Insertar un registro de venta
    async createSaleRecord(orderId, user_id, product_id, quantity, price, connection) {
        return new Promise((resolve, reject) => {
            const total = price * quantity;
            const query = `
                INSERT INTO sales 
                (product_id, quantity, total, user_id, order_id) 
                VALUES 
                (?, ?, ?, ?, ?)
            `;

            connection.query(
                query,
                [product_id, quantity, total, user_id, orderId],
                (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
                }
            );
        });
    }

    // Actualizar el stock del producto
    async updateProductStock(product_id, newStock, connection) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE products SET stock = ? WHERE id = ?',
                [newStock, product_id],
                (err, results) => {
                if (err) reject(err);
                resolve(results);
                }
            );
        });
    }

  async checkout(user_id, cart) {  
    // Iniciar la transacción
    const connection = await this.startTransaction();
  
    try {
        let total = 0;  // Total de la factura
        let itemsFactura = [];  // Para almacenar los ítems de la factura
    
        // 1. Verificar disponibilidad de stock y obtener los datos de los productos
        for (const item of cart) {
            const product = await this.getProductById(item.product_id, connection);
    
            if (!product) {
                throw new Error(`Producto con ID ${item.product_id} no encontrado`);
            }
    
            // Verificar si hay stock suficiente
            if (product.stock < item.quantity) {
                throw new Error(`No hay suficiente stock para el producto ${product.name}`);
            }
    
            // Calcular el precio total para este producto (sin impuestos y sin descuentos)
            const subtotalProducto = product.price * item.quantity;
            const itemFactura = {
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                unit_price: product.price,
                subtotal: subtotalProducto
            };
            itemsFactura.push(itemFactura);
    
            // Sumar al total general
            total += subtotalProducto;
        }
    
        // 2. Calcular descuentos e impuestos (esto se debe adaptar a tu lógica de negocio)
        const descuento = 0.1;  // Ejemplo: podría ser un porcentaje o una cantidad
        const IVA = 0.21;

        const descuentoTotal = total * descuento;
        const subtotalConDescuento = total - descuentoTotal;
        const impuestos = subtotalConDescuento * IVA;
        const totalFinal = subtotalConDescuento + impuestos;
    
        // 3. Crear el pedido en la base de datos
        const orderId = await this.createOrder(user_id, totalFinal, itemsFactura, descuento*100, descuentoTotal, IVA*100, impuestos, connection);
    
        // 4. Reducir el stock de los productos y registrar las ventas
        for (const item of cart) {
            const product = await this.getProductById(item.product_id, connection);
            const newStock = product.stock - item.quantity;
    
            // Actualizar stock
            await this.updateProductStock(item.product_id, newStock, connection);
    
            // Crear el registro de venta
            await this.createSaleRecord(orderId, user_id, item.product_id, item.quantity, product.price, connection);
        }
    
        // Confirmar la transacción
        await this.commitTransaction(connection);
    
        // Responder con el ID del pedido y los detalles
        return {
            status: 'success',
            orderId,
            totalFinal,
            itemsFactura
        };
  
    } catch (error) {
        // Si ocurre algún error, revertir la transacción
        await this.rollbackTransaction(connection);
        return {
            status: 'error',
            message: error.message
        };
    }
  }

}

module.exports = DB;
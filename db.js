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

    async registrarUsuarioBcryptjs(callback, newUser, isAdmin=0, isActive=1){
        let passwordCrypt = await bcryptjs.hash(newUser.password, Number(process.env.BCRYPT_SALT_ROUNDS))
        isAdmin = isAdmin ? 1 : 0;
        isActive = isActive ? 1 : 0;
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT us.username FROM users as us WHERE us.username="${newUser.username}"`, function(err, rows, fields) {
            if (rows.length == 1) {
                let mensajeError = 'El usuario ya existe, pruebe registrarse con otro nombre de usuario';
                callback(mensajeError);
            }else{
                conexion.query(`INSERT INTO users (username, first_name, last_name, email, password, is_admin, is_active) VALUES ("${newUser.username}", "${newUser.firstName}", "${newUser.lastName}", "${newUser.email}", "${passwordCrypt}", "${isAdmin}", "${isActive}")`, function(err, rows, fields) {
                    if (err) throw err;
                    callback(undefined);
                });
            }
            DB.closeConnection(conexion);
        });
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

}

module.exports = DB;
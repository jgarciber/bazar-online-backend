// npm install mysql
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
            host     : 'db',
            user     : 'root',
            password : '1234',
            database: 'products-api-db'
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
        conexion.query(`SELECT us.username, us.is_admin FROM users as us WHERE us.username="${name}" and us.password="${password}"`, function(err, rows, fields) {
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
    }
    
    obtenerProducto(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM products as p WHERE p.id = "${id}"`, function(err, rows, fields) {
            if (err) throw err;
            // console.log('The solution is: ', rows[0].solution);
            callback(rows);
            DB.closeConnection(conexion);
        });
    };

    obtenerProductos(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        // conexion.query(`SELECT * FROM products`, function(err, rows, fields) {
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
        // conexion.query(`SELECT p.id, p.name, p.price, s.quantity, s.total, s.sale_date FROM sales s INNER JOIN products p ON p.id=s.product_id`, function(err, rows, fields) {
        conexion.query(`SELECT p.id as id, p.name as name, p.price as price, s.quantity as quantity, s.total as total, s.sale_date as sale_date FROM sales s INNER JOIN products p ON p.id=s.product_id ORDER BY s.sale_date DESC`, function(err, rows, fields) {
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

    insertarVenta(callback, producto){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        let total = producto.price * producto.quantity;
        conexion.query(`INSERT INTO sales (product_id, quantity, total) VALUES ('${producto.id}', '${producto.quantity}', '${total}') `, function(err, rows, fields) {
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

    modificarProducto(callback, id, producto){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`UPDATE products SET name='${producto.name}', price=${producto.price}, stock=${producto.stock}, category='${producto.category}' WHERE id = ${id}`, function(err, rows, fields) {
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

}

module.exports = DB;

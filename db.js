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
    
    obtenerProducto(id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM products as p WHERE p.id = "${id}"`, function(err, rows, fields) {
            if (err) throw err;
            console.log('The solution is: ', rows[0].solution);
            DB.closeConnection(conexion);
        });
    };

    obtenerProductos(callback){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`SELECT * FROM products`, function(err, rows, fields) {
            // console.log('Estoy en el callback');
            if (err) throw err;
            callback(rows);
            DB.closeConnection(conexion);
        });
        // console.log('E ignorado el callback');
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

    borrarProducto(callback, id){
        const conexion = this.createMySQLConnection();
        this.openConnection(conexion);
        conexion.query(`DELETE FROM products WHERE id = "${id}"`, function(err, rows, fields) {
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

}

module.exports = DB;

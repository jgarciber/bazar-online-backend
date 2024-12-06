const express = require('express');
const app = express ();
app.use(express.json());
const jwt = require('jsonwebtoken');
// const jwt_secret = require('crypto').randomBytes(64).toString('hex');
const dotenv = require('dotenv');
// get config vars
dotenv.config();

const bcryptjs = require('bcryptjs');
const middleware = require('./middleware.js')

const DB = require('./db')
const db = new DB ('localhost', 'root', '');

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;

const productRouter = require("./routes/product-router-db");
app.use('/products', productRouter);
const categoryRouter = require("./routes/category-router-db");
app.use('/categories', categoryRouter);
const salesRouter = require("./routes/sales-router-db");
app.use('/sales', salesRouter);
const usersRouter = require("./routes/users-router-db");
app.use('/users', usersRouter);
const ordersRouter = require("./routes/orders-router-db");
app.use('/orders', ordersRouter);

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get('/status', (request, response) => {
    const status = {
        "Status": "Running"
    }
    response.send(status);
});

app.post('/login', function (req, res) {
    db.loginUsuarioBcryptjs((rows, err) => {
        if (rows.length == 1){
            let token = '';
            if (rows[0].is_admin){
                token = middleware.generateAccessToken({ user_id: rows[0].id, username: rows[0].username, is_admin: true });
            }else{
                token = middleware.generateAccessToken({ user_id: rows[0].id, username: rows[0].username, is_admin: false });
            }
            res.json({rows, token});
        }else{
            res.send({username : '', error: err});
        } 
    }, req.body.username, req.body.password);
});

// app.post('/signup', function (req, res) {
//     db.registrarUsuarioBcryptjs((err) => {
//         if (err == undefined){
//             res.status(201).json({
//                 message: `Se ha registrado el usuario correctamente`
//             });
//         }else{
//             res.send(err);
//         } 
//     }, req.body);
// });

// app.get('/logout', function (req, res) {
//     req.session.destroy();
//     res.send("logout success!");
// });

// app.get('/content', middleware.auth, function (req, res) {
//     res.send("You can only see this after you've logged in.");
// });
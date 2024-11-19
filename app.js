const express = require('express');
const app = express ();
app.use(express.json());
// const expressSession = require('express-session');
// app.use(expressSession({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     regenerate: false,
//     cookie: { secure: false }
// }));
const jwt = require('jsonwebtoken');
// const jwt_secret = require('crypto').randomBytes(64).toString('hex');

const dotenv = require('dotenv');
// get config vars
dotenv.config();

// access config var
// process.env.TOKEN_SECRET;

const bcryptjs = require('bcryptjs');

const cors = require('cors');
app.use(cors());

const DB = require('./db')
const db = new DB ('localhost', 'root', '');

// const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT;

// import { auth, authAdmin } from './middleware.mjs';
// const {auth, authAdmin} = require('./middleware.js')
const middleware = require('./middleware.js')
// const auth = require('./middleware.mjs')
// const authAdmin = auth.authAdmin;

// const productRouter = require("./routes/product-router")
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
    // db.loginUsuario((rows) => {
    db.loginUsuarioBcryptjs((rows) => {
        if (rows.length == 1){
            // req.session.username = rows[0].username;
            // if (rows[0].is_admin) req.session.is_admin = true;
            // req.session.save();
            // res.redirect('/content');
            // res.send(rows);
            // const token = generateAccessToken({ username: req.body.username });
            // const token = middleware.generateAccessToken({ username: rows[0].username });
            let token = '';
            if (rows[0].is_admin){
                token = middleware.generateAccessToken({ user_id: rows[0].id, username: rows[0].username, is_admin: true });
            }else{
                token = middleware.generateAccessToken({ user_id: rows[0].id, username: rows[0].username, is_admin: false });
            }
            res.json({rows, token});
        }else{
            // res.redirect('/content');
            // res.sendStatus(401);
            res.send({username : ''});
        } 
    }, req.body.username, req.body.password);
});


app.post('/signup', function (req, res) {
    // db.registrarUsuario((rows) => {
    db.registrarUsuarioBcryptjs((err) => {
        if (err == undefined){
            res.status(200).send('Se ha registrado el usuario correctamente');
        }else{
            // res.redirect('/content');
            // res.sendStatus(401);
            // res.send('Fallo en el registro');
            res.send(err);
        } 
    }, req.body.username, req.body.password);
});
// app.get('/login', function (req, res) {
//     if (!req.query.username || !req.query.password) {
//         res.send('login failed');
//     }
//     if(req.query.username === "amy" && req.query.password === "amyspassword") {
//         req.session.user = "amy";
//         req.session.admin = true;
//         // res.send(req.session.user);
//         // res.send('login ok');
//         req.session.save();
//         res.redirect('/content');
//         // res.status(200).send("usaurio_encontrado")
//     }else{
//         res.send('login failed');
//         // res.sendStatus(401); 
//     }
// });

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send("logout success!");
});
app.get('/content', middleware.auth, function (req, res) {
    res.send("You can only see this after you've logged in.");
});
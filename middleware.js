const auth = function(req, res, next) {
    // console.log(req.session.user);  **this is undefined**
    // console.log(req.session)
    // if (req.session.username)
        return next();
    // else
        // return res.redirect('/login');
        // return res.sendStatus(401);
};

const authAdmin = function(req, res, next) {
    // console.log(req.session.user);  **this is undefined**
    // if (req.session.username && req.session.is_admin)
        return next();
    // else
    //     return res.sendStatus(401);
};

const jwt = require('jsonwebtoken');
// const jwt_secret = require('crypto').randomBytes(64).toString('hex');
const dotenv = require('dotenv');
// get config vars
dotenv.config();

const generateAccessToken = function(payload) {
    // return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        // console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function authTokenAdmin(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        // console.log(err)
        if (err) return res.sendStatus(403)
        if (!user.is_admin) return res.sendStatus(403)
        req.user = user
        next()
    })
}
module.exports = {auth, authAdmin, generateAccessToken, authToken, authTokenAdmin};
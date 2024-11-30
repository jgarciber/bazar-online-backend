const jwt = require('jsonwebtoken');
// const jwt_secret = require('crypto').randomBytes(64).toString('hex');
const dotenv = require('dotenv');
// get config vars
dotenv.config();

const generateAccessToken = function(payload) {
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
module.exports = {generateAccessToken, authToken, authTokenAdmin};
const auth = function(req, res, next) {
    // console.log(req.session.user);  **this is undefined**
    console.log(req.session)
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

module.exports = {auth, authAdmin};
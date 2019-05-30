//verify token
module.exports = function verifyToken (req, res, next) {
    //get auth header value
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        // get token
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        //grant token
        req.token = bearerToken;
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}
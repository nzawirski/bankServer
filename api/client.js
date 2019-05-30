const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')

let db = require('../config/db')

router.get('/', verifyToken, (req, res) => {
    
    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            console.log(authData.user);
            res.json({
                message: authData.user
            })

        }
    })

})

//verify token
function verifyToken(req, res, next) {
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

module.exports = router
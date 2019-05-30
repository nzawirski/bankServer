const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')

router.get('/', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok
            console.log(authData);
            res.json({
                message: authData.user
            })

        }
    })

})

router.get('/accounts', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let userId = authData.id
            client.connect()
            const query = `SELECT * FROM bank.konto a
            WHERE a.id_konta 
            IN ( SELECT id_konta FROM bank.konto_klienta
                WHERE id_klienta = ${userId} )`

            client.query(query)
                .then(qres => {
                    res.json({
                        message: qres.rows
                    })
                    client.end()
                })
                .catch(e => {
                    console.error(e.stack)
                    res.status(500).json({
                        message: e.message
                    })
                })

        }
    })

})


module.exports = router
const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')

router.get('/:paymentId/', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let paymentId = req.params.paymentId

            client.connect()

            const query = `SELECT * FROM bank.wplata a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_wplaty = ${paymentId}`

            client.query(query)
                .then(qres => {
                    if (qres.rowCount > 0) {
                        if (authData.id == qres.rows[0].id_klienta) {
                            res.json({
                                message: qres.rows
                            })
                        } else {
                            res.status(400).json({
                                message: "Wrong User"
                            })
                        }
                    }
                    else {
                        res.json({
                            message: "no items found"
                        })
                    }
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
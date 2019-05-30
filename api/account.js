const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')

//saldo
router.get('/:accountId', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT saldo FROM bank.konto a
            WHERE a.id_konta = ${accountId}`

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
//przelewy wychodzace
router.get('/:accountId/getTransfers', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT * FROM bank.przelew a
            WHERE a.id_konta_zrodlowego = ${accountId}`

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
//przelewy przychodzace
router.get('/:accountId/getTransfers/incoming', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT * FROM bank.przelew a
            WHERE a.id_konta_docelowego = ${accountId}`

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
//lokaty
router.get('/:accountId/getInvestments', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT * FROM bank.lokata a
            WHERE a.id_konta = ${accountId}`

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

//kredyty
router.get('/:accountId/getCredits', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT * FROM bank.kredyt a
            WHERE a.id_konta = ${accountId}`

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
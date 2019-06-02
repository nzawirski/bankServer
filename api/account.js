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
        }
        else {
            // user ok

            const client = new Client(db)

            let accountId = req.params.accountId

            client.connect()

            const query = `SELECT id_konta, saldo, id_klienta FROM bank.konto a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_konta = ${accountId}`

            client.query(query)
                .then(qres => {

                    if (authData.id == qres.rows[0].id_klienta) {
                        res.json({
                            message: qres.rows
                        })
                    } else {
                        res.status(400).json({
                            message: "Wrong User"
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

            let query = `SELECT * FROM bank.przelew a
            JOIN bank.konto_klienta b ON a.id_konta_zrodlowego = b.id_konta
            WHERE a.id_konta_zrodlowego = ${accountId}`

            if(req.query.sort){ 
                query += ` ORDER BY a.data ${req.query.sort}`
            }

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
                    } else {
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

            let query = `SELECT * FROM bank.przelew a
            JOIN bank.konto_klienta b ON a.id_konta_docelowego = b.id_konta
            WHERE a.id_konta_docelowego = ${accountId}`

            if(req.query.sort){ 
                query += ` ORDER BY a.data ${req.query.sort}`
            }

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

            let query = `SELECT * FROM bank.lokata a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_konta = ${accountId}`

            if(req.query.sort){ 
                query += ` ORDER BY a.data ${req.query.sort}`
            }

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

            let query = `SELECT * FROM bank.kredyt a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_konta = ${accountId}`

            if(req.query.sort){ 
                query += ` ORDER BY a.data ${req.query.sort}`
            }

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

//wpłaty
router.get('/:accountId/getPayments', verifyToken, (req, res) => {

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

            let query = `SELECT * FROM bank.wplata a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_konta = ${accountId}`

            if(req.query.sort){ 
                query += ` ORDER BY a.data ${req.query.sort}`
            }

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
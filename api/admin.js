const express = require('express')
const router = express.Router()

const { Client } = require('pg')

let db = require('../config/db')

// Klienci
router.get('/getClients', (req, res) => {

    const client = new Client(db)

    client.connect()

    const query = `SELECT * FROM bank.klient`

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

})

//Konta klientow
router.get('/getAccounts', (req, res) => {

    const client = new Client(db)

    client.connect()

    const query = `select id_konta, saldo, id_klienta, imie, nazwisko, login, id_oddzialu_banku
    from bank.konto
    natural join bank.konto_klienta
    natural join bank.klient`

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

})

module.exports = router


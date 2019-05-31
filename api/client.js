const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')
const bcrypt = require('bcrypt');
const saltRounds = 10;

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

// konta klienta
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

//dodawanie klienta
router.post('/add', (req, res) => {
    const client = new Client(db)

    let imie = req.body.imie ? inQuotes(req.body.imie) : null
    let nazwisko = req.body.nazwisko ? inQuotes(req.body.nazwisko) : null
    let login = req.body.login ? inQuotes(req.body.login) : null
    let password = req.body.password ? req.body.password : null
    let id_oddzialu_banku = req.body.id_oddzialu_banku ? inQuotes(req.body.id_oddzialu_banku) : null


    client.connect()
    bcrypt.hash(password, saltRounds, function (err, hash) {

        const query = `INSERT INTO bank.klient(
            imie, nazwisko, login, password, id_oddzialu_banku)
           VALUES (${imie}, ${nazwisko}, ${login}, ${inQuotes(hash)}, ${id_oddzialu_banku});`

        console.log(query)
        client.query(query)
            .then(qres => {
                res.sendStatus(200)
                client.end()
            })
            .catch(e => {
                console.error(e.stack)
                res.status(500).json({
                    message: e.message
                })
            })

    })

})

inQuotes = (string) => {
    return '\'' + string + '\''
}


module.exports = router
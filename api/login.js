const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
const bcrypt = require('bcrypt');

let db = require('../config/db')

router.post('/', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({
            message: "login or password not provided"
        })
    }
    const client = new Client(db)
    const query = `SELECT * FROM bank.klient WHERE login = '${login}'`

    client.connect()
    client.query(query)
        .then(qres => {
            if (qres.rowCount > 0) {



                let passInDB = qres.rows[0].password
                let userId = qres.rows[0].id_klienta

                bcrypt.compare(password, passInDB, (err, _res) => {
                    if (err) throw err;
                    if (_res) {

                        //pass good
                        jwt.sign({ user: login, id: userId }, config.get('secretKey'), (err, token) => {
                            res.json({ token: token })
                        });

                    } else {
                        //pass bad
                        res.status(400).json({
                            message: "Wrong Password"
                        })
                    }

                })
            }else{
                res.status(200).json({
                    message: `user ${login} does not exist`
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

})

module.exports = router
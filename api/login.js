const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')

let db = require('../config/db')

router.post('/login', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({
            message: "login or password not provided"
        })
    }
    //verifyCredentials(login, password)
    const client = new Client(db)
    const query = `SELECT password FROM bank.klient WHERE login = '${login}'`
    client.connect()
    client.query(query, (err, qres) => {
        if(err) throw err

        let passInDB = qres.rows[0].password

        if(password == passInDB){
            //pass good
            jwt.sign({ user: login }, config.get('secretKey'), (err, token) => {
                res.json({ token: token })
            });

        }else{
            //pass bad
            res.status(400).json({
                message: "Wrong Password"
            })
        }
    })

    

})


module.exports = router
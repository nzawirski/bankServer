const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
const { Pool } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')


router.get('/:creditId/', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let creditId = req.params.creditId

            client.connect()

            const query = `SELECT * FROM bank.kredyt a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_kredytu = ${creditId}`

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

router.post('/add', (req, res) => {

    let id_konta = req.body.id_konta ? req.body.id_konta : null
    let kwota = req.body.kwota ? req.body.kwota : null
    let oprocentowanie = req.body.oprocentowanie ? req.body.oprocentowanie : null
    let stan = req.body.stan ? inQuotes(req.body.stan) : null

    const pool = new Pool(db)

    let makeCredit = async () => {
        const client = await pool.connect()

        try {
            await client.query('BEGIN') 

            await client.query(`INSERT INTO bank.kredyt(
                id_konta, kwota, oprocentowanie, data, stan)
                VALUES ( ${id_konta}, ${kwota}, ${oprocentowanie}, NOW(), ${stan});`)

            await client.query(`UPDATE bank.konto
	                SET  saldo=saldo+(${kwota})
	                WHERE id_konta=${id_konta};`)

            await client.query('COMMIT')
            res.sendStatus(200)

        } catch (e) {
            await client.query('ROLLBACK')
            res.status(500).json({
                message: e.message
            })
            throw e
        } finally {
            client.release()
        }
    }
    makeCredit().catch(e => {
        console.error(e.stack)
        res.status(500).json({
            message: e.message
        })
    })

})


inQuotes = (string) => {
    return '\'' + string + '\''
}

module.exports = router
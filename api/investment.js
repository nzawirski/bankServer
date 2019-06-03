const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
const { Pool } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')


router.get('/:investmentId/', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let investmentId = req.params.investmentId

            client.connect()

            const query = `SELECT * FROM bank.lokata a
            NATURAL JOIN bank.konto_klienta
            WHERE a.id_lokaty = ${investmentId}`

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
    let kwota_poczatkowa = req.body.kwota_poczatkowa ? req.body.kwota_poczatkowa : null
    let kwota_aktualna = req.body.kwota_aktualna ? req.body.kwota_aktualna : null
    let oprocentowanie = req.body.oprocentowanie ? req.body.oprocentowanie : null

    const pool = new Pool(db)

    let makeCredit = async () => {
        const client = await pool.connect()

        try {
            await client.query('BEGIN')

            await client.query(`INSERT INTO bank.lokata(
                 id_konta, kwota_poczatkowa, kwota_aktualna, oprocentowanie, data)
                VALUES (${id_konta}, ${kwota_poczatkowa}, ${kwota_aktualna}, ${oprocentowanie}, NOW());`)

            await client.query(`UPDATE bank.konto
	            SET  saldo=saldo-(${kwota_poczatkowa})
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
const express = require('express')
const router = express.Router()
const config = require('config')
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
const { Pool } = require('pg')
let verifyToken = require('../token/verifyToken')
let db = require('../config/db')


router.get('/:transferId/', verifyToken, (req, res) => {

    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.status(403).json({
                message: err
            })
        } else {
            // user ok

            const client = new Client(db)

            let transferId = req.params.transferId

            client.connect()

            const query = `SELECT id_przelewu, id_konta_zrodlowego, id_konta_docelowego, kwota, bb.id_klienta AS "klient_zrodlo", cc.id_klienta AS "klient_docel", data 
            FROM bank.przelew a
            JOIN bank.konto_klienta b ON a.id_konta_zrodlowego = b.id_konta
            JOIN bank.klient bb ON b.id_klienta = bb.id_klienta
            JOIN bank.konto_klienta c ON a.id_konta_docelowego = c.id_konta
            JOIN bank.klient cc ON c.id_klienta = cc.id_klienta
                        WHERE a.id_przelewu = ${transferId}`

            client.query(query)
                .then(qres => {
                    if (qres.rowCount > 0) {
                        if (authData.id == qres.rows[0].klient_zrodlo || authData.id == qres.rows[0].klient_docel) {
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

//przelew
router.post('/add', (req, res) => {

    let id_konta_zrodlowego = req.body.id_konta_zrodlowego ? inQuotes(req.body.id_konta_zrodlowego) : null
    let id_konta_docelowego = req.body.id_konta_docelowego ? inQuotes(req.body.id_konta_docelowego) : null
    let kwota = req.body.kwota ? req.body.kwota : null

    const pool = new Pool(db)

    let makeTransfer = async () => {
        const client = await pool.connect()

        try {
            await client.query('BEGIN') 

            //take money away from source
            let querySrc = `UPDATE bank.konto
            SET  saldo=saldo+(-${kwota})
            WHERE id_konta=${id_konta_zrodlowego};`
            await client.query(querySrc)
            console.log(querySrc)
                    
            //give money to target
            let queryTarget = `UPDATE bank.konto
            SET  saldo=saldo+(${kwota})
            WHERE id_konta=${id_konta_docelowego};`
            await client.query(queryTarget)
            console.log(queryTarget)

            //record transfer
            let queryRec = `INSERT INTO bank.przelew(
                id_konta_zrodlowego, id_konta_docelowego, kwota, data)
                VALUES ( ${id_konta_zrodlowego}, ${id_konta_docelowego}, ${kwota}, NOW());`
            await client.query(queryRec)
            console.log(queryRec)

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
    makeTransfer().catch(e => {
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
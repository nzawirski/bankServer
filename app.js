const express = require('express')
const app = express()
const config = require('config')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
app.use(cors());
app.use(express.json());
let verifyToken = require('./token/verifyToken')

// db
let db = require('./config/db')

testConnection()
async function testConnection() {
    const client = new Client(db)
    try {

        await client.connect()
        console.log("Connected to DB successfully.")

    }
    catch (e) {
        console.error(e)
    }
    finally {
        await client.end()
        console.log("Good to go.")
    }
}

//routes
app.use('/api/login', require('./api/login'))
app.use('/api/client', require('./api/client'))
app.use('/api/account', require('./api/account'))
app.use('/api/payment', require('./api/payment'))

app.use('/admin/', require('./api/admin'))

app.listen(3000, () => {
    console.log('Server Started on port 3000');
})


const express = require('express')
const app = express()
const config = require('config')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { Client } = require('pg')
app.use(cors());
app.use(express.json());

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

app.get('/api', (req, res) => {
    console.log('>>Bang');

    getKonta()

    res.json({
        message: 'Bang Bank'
    })
})

async function getKonta() {
    const client = new Client(db)
    try {

        await client.connect()
        console.log("Connected successfully.")

        const { rows } = await client.query("select * from bank.konto")
        console.table(rows)

    }
    catch (e) {
        console.log(e)
    }
    finally {
        await client.end()
        console.log("Client disconnected successfully.")
    }

}

app.get('/api/secret', verifyToken, (req, res) => {
    jwt.verify(req.token, config.get('secretKey'), (err, authData) => {
        if (err) {
            res.sendStatus(403).json({
                message: err
            })
        } else {
            console.log(authData.user);
            res.json({
                message: "Welcome to my secret route",
                authData
            })
        }
    })

})

//verify token
function verifyToken(req, res, next) {
    //get auth header value
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        // get token
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        //grant token
        req.token = bearerToken;
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

app.listen(3000, () => {
    console.log('Server Started on port 3000');
})


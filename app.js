const express = require('express')
const app = express()

const { Client } = require('pg')
const client = new Client({
    user: "2018_zawirski_nikodem",
    password: "29565",
    host: "195.150.230.210",
    port: 5434,
    database: "2018_zawirski_nikodem"
})

const jwt = require('jsonwebtoken')

client.connect()
    .then(() => {
        console.log("Connected to DB successfuly");
    })
    .catch((e) => {
        console.error(e)
    })
    .finally(() => {
        client.end();
    })

//var connect = "postgres://2018_zawirski_nikodem:29565@195.150.230.210/2018_zawirski_nikodem"

app.use(express.json());

app.get('/api', (req, res) => {
    console.log('>>Bang');
    res.json({
        message: 'Bang Bank'
    })
})

app.get('/api/secret', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secret', (err, authData) => {
        if (err) {
            res.sendStatus(403).json({
                message: err
            })
        } else {
            console.log('Intruder Alert! Red spy in base!');
            res.json({
                message: "Welcome to my secret route",
                authData
            })
        }
    })

})

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({
            message: "login or password not provided"
        })
    }
    //todo: verify credentials

    jwt.sign({ user: login }, 'secret', (err, token) => {
        res.json({ token: token })
    });

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


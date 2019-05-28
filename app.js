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

app.post('/api/login', (req, res) => {
    console.log('name: ' + req.body.login + ' pass: ' + req.body.password);
    res.send('name: ' + req.body.login + ' pass: ' + req.body.password);
})

app.listen(3000, () => {
    console.log('Server Started on port 3000');
})


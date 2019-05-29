const config = require('config')

const db = {
    user: config.get("user"),
    password: config.get("password"),
    host: config.get("host"),
    port: config.get("port"),
    database: config.get("database")
}
module.exports = db
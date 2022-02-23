var mysql = require('mysql');

const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "trading"
});

module.exports = database;

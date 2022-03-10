var mysql = require('mysql');

const database = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "trading"
});

module.exports = database;

var mysql = require('mysql');

var database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "trading-simulator"
});

database.connect(function (err) {
    console.log(">   [DATABASE] sikeres csatlakozás");
});

module.exports = database;
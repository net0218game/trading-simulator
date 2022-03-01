// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')
const database = require("./database.js");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

//szerver oldali alkalmazasok felallitasa / konfiguracioja
const express = require("express");
const path = require("path");
const {response} = require("express");
var app = express();
var server = app.listen(4000);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
//app.use(express.static('public'));

let price = 0;
let values = [];
let lastsec = 0;
// ennyi adatot fog abrazolni a diagramm
let maxItems = 100;
// tizedes jegyek az ar vegen
let digits = 4;
// crypto
let coin = "btc";
// coin pair
let pair = "busd";

// session generalasa
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}));

// bejovo adat feldolgozasa
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// root directory path-je
app.use(express.static(path.join(__dirname, '/public')));

// cookie parser nemtom mi
app.use(cookieParser());

// ebbe a valtozoban van mentve a session
var session;

app.get('/', (req, res) => {
    session = req.session;
    if (session.userid) {
        console.log(">   [session] be vagy jelentkezve")
        res.sendFile('public/main/main.html', {root: __dirname})
    } else {
        console.log(">   [session] nem vagy bejelentkezve")
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/main', (req, res) => {
    session = req.session;
    if (session.userid) {
        console.log(">   [session] be vagy jelentkezve")
        res.sendFile('public/main/main.html', {root: __dirname})
    } else {
        console.log(">   [session] nem vagy bejelentkezve")
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/register', (req, res) => {
    res.sendFile('public/register/register.html', {root: __dirname})
});

// fo oldal
app.post('/main', (req, res) => {
    getLoginInfo(req.body.username).then(function (result) {
        if (req.body.username == result[0].username && req.body.password == result[0].password
            && req.body.password.length > 7) {
            session = req.session;
            session.userid = req.body.username;
            getInfo(req.body.username).then(function (data) {
                session.usernameid = data[0].userID;
            }).catch(function (error) {
                res.send("error");
            });
            console.log(">   [session] sikeres bejelentkezes", session.userid, "néven");
            //console.log(req.session)
            res.sendFile('/public/main/main.html', {root: __dirname});
        } else {
            console.log(">   [server] sikertelen bejelentkezes");
            res.send('Invalid username or password');
        }
    }).catch(function () {
        res.sendFile('/public/error/error.html', {root: __dirname});
    });
});

// regisztralas funcio
app.post('/registeruser', function (req, res) {
    if (req.body.password === req.body.password2) {
        if (req.body.username.length > 3) {
            if (req.body.password.length > 7) {
                registerUser(req.body.username, req.body.password).then(function () {
                    res.sendFile(path.join(__dirname + '/public/login/login.html'));
                }).catch(function (error) {
                    res.send(error);
                    console.log("something went wrong", error);
                });
            } else {
                res.send("Password is not long enough! Min. 8 characters")
            }
        } else {
            res.send("Username is not long enough! Min. 3 characters")
        }
    } else {
        res.send("The 2 given password doesn't match!");
    }
});

// portfolio oldal
app.get('/user', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/wallet/wallet.html'));
        getPortfolio(session.userid).then(function (result) {

        });
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

// kijelentkezes
app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log(">   [session]", session.userid, "kijelentkezett!")
    res.redirect('/');
});

app.post('/error', (req, res) => {
    res.sendFile('public/error/error.html', {root: __dirname});
});

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {
    let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@trade');
    console.log(">   [Socket.io] sikeres csatlakozás")

    function getPrice() {
        //websocket cucc

        let before = 0;
        ws.onmessage = (event) => {
            // ha be van jelentkezve valaki
            if (session.userid) {

                let cryptodata = JSON.parse(event.data);
                price = parseFloat(cryptodata.p).toFixed(digits);
                before = price;

                const d = new Date();
                let sec = d.getSeconds();

                // belerakja egy listaba a datumot (elso hely), es az arat (masodik hely)
                if (sec !== lastsec) {
                    values.push([(d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()).toString(), parseInt(price)]);
                    lastsec = sec;
                }
                // diagramm max adatok ellenorzese
                if (values.length >= maxItems) {
                    values.shift();
                }
                // lekerdezes az adatbazisbol
                getInfo(session.userid).then(function (result) {
                    // adat kuldese socket.io val
                    socket.emit("data", {
                        price: price,
                        values: values,
                        coin: coin,
                        pair: pair,
                        tokens: result[0].token,
                        username: session.userid
                    });
                }).catch(function (error) {
                    console.log(error);
                });
            }

        }
    }

    // vasarlas funcio
    socket.on("buy", function (data) {
        buy(data);
    });
    // eladas funkcio
    socket.on("sell", function (data) {
        sell(data);
    });
    getPrice();
});

function buy(data) {
    let currentWealth = 0
    if (data.amount > 0) {

        getInfo(session.userid).then(function (userdata) {
            id = userdata[0].ID;
            let currentValue = data.amount * price;

            // ha van ra eleg tokenje a felhasznalonak
            if (userdata[0].token >= currentValue) {
                getPortfolio(session.userid).then(function (result) {
                    if (result.length > 0) {

                        currentWealth = parseFloat(result[0].currencyValue.toFixed(10));
                        data.amount = parseFloat(data.amount)
                        let setto = data.amount + currentWealth
                        let setpair = parseFloat(result[0].pairValue) + currentValue
                        console.log("pair", setpair)
                        console.log("mar van")
                        let sql = "UPDATE coins SET currencyValue =" + setto + ", pairValue =" + setpair + "WHERE userID = " + id;

                        database.query(sql, function (error) {
                            if (error) {
                                console.log(error)
                            } else {
                                let userTokens = userdata[0].token - currentValue;
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log(error)
                                        console.log(">   [MySQL] baj van a vasarlas funkcioval")
                                    }
                                });
                            }
                        })
                    } else {
                        console.log("meg nincs")
                        let sql = "INSERT INTO coins(userID, currency, pair, currencyValue, pairValue) VALUES(" + id
                            + ",'" + coin + "','" + pair + "'," + data.amount + "," + currentValue + ")";
                        console.log(sql)
                        database.query(sql, function (error) {
                            if(error) {
                                console.log(error)
                            }
                        })
                    }
                }).catch(function () {

                });
                console.log("vettel", data.amount, "db", coin + "-t", currentValue, "értékben")
            } else {
                // ha a felhasznalonak nincsen eleg tokenje
                console.log("nincs ra eleg tokened!")
            }
        });
    } else {
        // ha nulla van beirva osszegnek
        console.log("0 nál többet kell vegyél!")
    }
}

function sell(data) {
    if (data.amount > 0) {
        getPortfolio(session.userid).then(function (result) {
            currencies = [];
            for (let i = 0; i < result.length; i++) {
                if (currencies.includes(result[i].currency) === false) {
                    currencies.push(result[i].currency);
                }
            }
            currencyValues = []
            for (let i = 0; i < currencies.length; i++) {
                currencyValues.push([currencies[i], 0])
                for (let j = 0; j < result.length; j++) {
                    if (result[j].currency === currencies[i]) {
                        currencyValues[i][1] += result[j].currencyValue;
                    }
                }
            }
            userValue = 0;
            for (let i = 0; i < currencyValues.length; i++) {
                if (currencyValues[i][0] === coin) {
                    userValue += currencyValues[i][1]
                }
            }
            console.log(userValue)

            if (userValue <= data.amount) {

            }
        }).catch(function () {
            console.log("baj van");
        });
    } else {
        console.log("0 nal tobbet kell eladnod!");
    }
}

// adatbazis lekerdezesek
function getInfo(user) {
    return new Promise((resolve, reject) => {

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(">   [MySQL] nem inditottad el az xamppot!");
            } else {
                return resolve(results);
            }
        });
    });
}

// uj felhasznalo regisztralasa
function registerUser(username, password) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT username FROM users WHERE username =" + "'" + username + "'";

        database.query(sql, function (error, results) {
            if (error) {
                return reject(error);
            } else {
                // ha meg nem letezik ilyen felhasznalo es az adatok megfelelnel a kovetelmenyeknek
                if (results.length === 0 && username.length > 3 && password.length > 7) {
                    // felhasznalo letrehozasa a users tablaban 10 000 alap tokennel
                    var sql = "INSERT INTO users(username, password, token) VALUES (" + "'" + username + "'"
                        + "," + "'" + password + "'" + "," + "'" + 10000 + "'" + ")";

                    database.query(sql, function (error, results) {
                        if (error) {
                            return reject(error);
                        } else {
                            console.log(">   [MySQL] user", username, "has been registered!");
                            return resolve(results);
                        }
                    });
                } else {
                    console.log(">   [MySQL] user", username, "already exists!");
                    return reject("user '" + username + "' already exists!");
                }
            }
        });
    });
}

function getLoginInfo(user) {
    return new Promise((resolve, reject) => {

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "'";

        database.query(sql, function (error, results) {
            if (error) {
                console.log(">   [MySQL] valami baj van az id keresesevel a felhasznalok tablaban");
                return reject()
            } else {
                return resolve(results);
            }
        });
    });
}

function getPortfolio(user) {
    return new Promise((resolve, reject) => {
        getInfo(user).then(function (result) {
            id = result[0].ID;
            var sql = "SELECT * FROM coins WHERE userID = " + id;
            database.query(sql, function (error, results) {
                if (error) {
                    console.log(">   [MySQL] valami baj van a portfolio lekeresevel a coins tablaban");
                } else {
                    return resolve(results);
                }
            });
        }).catch(function () {
            return reject();
            console.log("itt van a baj");
        });
    });
}
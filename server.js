// SOCKET.IO NAK AZ IMPORTALASA (sry caps)
var socket = require('socket.io');
const WebSocket = require('ws')
const database = require("./database.js");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

//szerver oldali alkalmazasok felallitasa / konfiguracioja
const express = require("express");
const path = require("path");
var app = express();

app.use(require('cors')())

var server = app.listen(5000);
var io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5000',
        optionsSuccessStatus: 200,
        methods: ["GET", "POST"]
    }
});
//app.use(express.static('public'));

let price = 0;
let values = [];
let lastsec = 0;
// ennyi adatot fog abrazolni a diagram
let maxItems = 100;
// tizedes jegyek az ar vegen
let digits = 2;
// crypto
let coin = "";
// coin pair
let pair = "busd";
// Kezdo token ertek dollarban megadva
let initialValue = 10000

// Price change percent
let pricechg = 0;

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

app.get('/', (req, res, next) => {
    session = req.session;
    res.sendFile('public/welcome/welcome.html', {root: __dirname});
});

app.get('/main', (req, res) => {
    session = req.session;
    if (session.userid) {
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
    getInfo(req.body.username).then(function (result) {
        if (result.length > 0) {
            if (req.body.username === result[0].email || req.body.username === result[0].username
                && req.body.password === result[0].password
                && req.body.password.length > 7) {

                session = req.session;
                session.userid = result[0].username;
                session.usernameid = result[0].userID;
                res.sendFile('/public/frontpage/frontpage.html', {root: __dirname});
            } else {
                res.send('Invalid username or password');
            }
        } else {
            res.send("User " + req.body.username + " doesn't exist!")
        }
    }).catch(function () {
        console.log("problema van")
        res.sendFile('/public/error/error.html', {root: __dirname});
    });
});

// regisztralas funcio
app.post('/registeruser', function (req, res) {
    if (req.body.password === req.body.password2) {
        if (req.body.username.length > 3) {
            if (req.body.password.length > 7) {
                registerUser(req.body.username, req.body.password, req.body.email).then(function () {
                    res.sendFile(path.join(__dirname + '/public/login/login.html'));
                }).catch(function (error) {
                    res.send(error);
                    console.log("Error #1", error);
                });
            } else {
                res.send("Password is not long enough! Min. 8 characters")
            }
        } else {
            res.send("Username is not long enough! Min. 3 characters")
        }
    } else {
        res.send("The 2 given passwords doesn't match!");
    }
});

app.post('/change', function (req, res) {
    if (req.body.password !== req.body.password2) {
        if (req.body.password2.length > 7) {
            changePassword(req.body.username, req.body.password, req.body.password2, req.body.email).then(function () {
                res.sendFile(path.join(__dirname + '/public/login/login.html'));
            }).catch(function (error) {
                res.send(error);
                console.log("Error #2", error);
            });
        } else {
            res.send("Password is not long enough! Min. 8 characters.")
        }
    } else {
        res.send("New password can't be the same as the old one.");
    }
});

// portfolio oldal
app.get('/portfolio', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/wallet/wallet.html'));
        getPortfolio(session.userid).then(function (result) {

        });
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/profile', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/profile/profile.html'));
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/chng', (req, res) => {
    session = req.session;
    if (session.userid) {
        res.sendFile('public/changepassword/chngpswd.html', {root: __dirname})
    } else {
        res.sendFile('public/login/login.html', {root: __dirname})
    }
});

app.get('/index', function (req, res) {
    session = req.session;
    if (session.userid) {
        res.sendFile(path.join(__dirname + '/public/frontpage/frontpage.html'));
    } else {
        res.sendFile('public/login/login.html', {root: __dirname});
    }
});

app.get('/error', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/error/error.html'));
});

// kijelentkezes
app.get('/logout', (req, res) => {
    req.session.destroy();
    console.log(">   [session]", session.userid, "kijelentkezett!")
    res.redirect('/');
});

//Ha uj kapcsolat jon letre
io.on('connection', (socket) => {

    let ws = new WebSocket('wss://stream.binance.com:9443/ws/' + coin + pair + '@ticker');
    let wsbtc = new WebSocket('wss://stream.binance.com:9443/ws/btcbusd@ticker');
    let wseth = new WebSocket('wss://stream.binance.com:9443/ws/ethbusd@ticker');
    let wsbnb = new WebSocket('wss://stream.binance.com:9443/ws/bnbbusd@ticker');
    let wsdoge = new WebSocket('wss://stream.binance.com:9443/ws/dogebusd@ticker');
    let wsshib = new WebSocket('wss://stream.binance.com:9443/ws/shibbusd@ticker');
    console.log(">   [Socket.io] sikeres csatlakozás")

    getInfo(session.userid).then(function (result) {
        let passwstars = '*'.repeat(result[0].password.length);
        socket.emit("userdata", {
            username: result[0].username,
            tokens: result[0].token,
            email: result[0].email,
            pfp: result[0].pfp,
            password: passwstars
        });
    }).catch(function (error) {
        console.log("Error #3", error);
    });

    getPortfolio(session.userid).then(function (result) {
        getInfo(session.userid).then(function (userinfo) {
            let userPortfolio = []
            chart = []
            for (let i = 0; i < result.length; i++) {
                let data = [result[i].currency, result[i].currencyValue, result[i].pair, result[i].pairValue]
                userPortfolio.push(data)
            }
            getStatInfo(session.userid).then(function (stat) {
                let userSpent = stat[0].spent;
                let userTrades = stat[0].trades;

                socket.emit("portfolio", {
                    portfolio: userPortfolio,
                    userinfo: userinfo[0],
                    initialValue: initialValue,
                    spent: userSpent,
                    trades: userTrades
                });
            }).catch(function (error) {
                console.log("Error #34", error);
            });
        }).catch(function (error) {
            console.log(error, "Error #4")
        });

    }).catch(function (error) {
        console.log(error, "Error Code #5")
    });

    function getPrice() {
        //websocket cucc
        ws.onmessage = (event) => {
            // ha be van jelentkezve valaki es ha van megadva coin
            if (coin.length > 0) {

                let cryptodata = JSON.parse(event.data);


                if (coin === "shib") {
                    price = parseFloat(cryptodata.c).toFixed(8);
                } else if (coin === "doge") {
                    price = parseFloat(cryptodata.c).toFixed(4);
                } else {
                    price = parseFloat(cryptodata.c).toFixed(digits);
                }
                pricechg = cryptodata.P;

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
                        change: pricechg,
                        values: values,
                        coin: coin,
                        pair: pair,
                        tokens: result[0].token,
                        username: session.userid
                    });
                }).catch(function (error) {
                    console.log("Error #6", error);
                });
            }
        }
    }

    wsbtc.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("btcData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wseth.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("ethData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsbnb.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(digits);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("bnbData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsdoge.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(4);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("dogeData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    wsshib.onmessage = (event) => {
        let Thiscryptodata = JSON.parse(event.data);
        let Thisprice = parseFloat(Thiscryptodata.c).toFixed(8);
        let Thispricechg = Thiscryptodata.P;

        socket.emit("shibData", {
            price: Thisprice,
            change: Thispricechg
        });
    }

    socket.on("changeCoinPair", function (data) {
        console.log(values)
        values = []
        coin = data.coin;
    });

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
    // Felhasznalo jelenlegi vagyona
    let currentWealth = 0
    data.amount = parseFloat(data.amount);
    // Ellenorzi hogy 0-nal tobbet akar-e venni
    if (data.amount > 0) {

        getInfo(session.userid).then(function (userdata) {
            let id = userdata[0].ID;
            // Beirt mennyiseg jelenlegi erteke
            console.log(data.amount, price)
            let currentValue = parseFloat(data.amount * price);
            let userTokens = userdata[0].token - currentValue;

            // Ha van ra eleg tokenje a felhasznalonak
            if (userdata[0].token >= currentValue) {
                getPortfolio(session.userid).then(function (result) {
                    // Ha mar van feljegyzett vasarlasa a felhasznalonak
                    if (result.length > 0) {

                        currentWealth = parseFloat(result[0].currencyValue.toFixed(10));

                        // Valuta ertek
                        let setto = data.amount + currentWealth;
                        // Par ertek
                        let setpair = parseFloat(result[0].pairValue) + currentValue;
                        let sql = "UPDATE coins SET currencyValue =" + setto + ", pairValue =" + setpair + " WHERE userID = " + id + " AND currency = " + "'" + coin + "'" + " AND pair = " + "'" + pair + "'";

                        database.query(sql, function (error, results) {
                            // Ha mar van feljegyzett adat a felhasznalohoz ezzel a valutaval
                            if (results.affectedRows > 0) {
                                if (error) {
                                    console.log("Error #7", error);
                                } else {
                                    sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                    database.query(sql, function (error) {
                                        if (error) {
                                            console.log("Error #8", error);
                                        }
                                    });
                                }
                            } else {
                                // Ha meg nincs feljegyzett adat a felhasznalohoz ezzel a valutaval
                                sql = "INSERT INTO coins(userID, currency, pair, currencyValue, pairValue) VALUES(" + id
                                    + ",'" + coin + "','" + pair + "'," + data.amount + "," + currentValue + ")";
                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log("Error #9", error);
                                    } else {
                                        sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                        database.query(sql, function (error) {
                                            if (error) {
                                                console.log("Error #10", error)
                                                console.log(">   [MySQL] baj van a vasarlas funkcioval")
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        // Ha meg nincs feljegyzett vasarlasa a felhasznalonak
                        console.log("még nincs cryptod")
                        let sql = "INSERT INTO coins(userID, currency, pair, currencyValue, pairValue) VALUES(" + id
                            + ",'" + coin + "','" + pair + "'," + data.amount + "," + currentValue + ")";
                        database.query(sql, function (error) {
                            if (error) {
                                console.log("Error #11", error)
                            } else {
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log("Error #12", error)
                                    }
                                });
                            }
                        });
                    }
                    // Ide jon majd a stats adatbazis tablaban a spent mezo hozzaadasa
                    getStatInfo(session.userid).then(function (result) {
                        let userTrades = result[0].trades;
                        let userSpent = result[0].spent;
                        userSpent += currentValue;
                        userTrades += 1;
                        // Stats tablaban a TRADES ertek frissitese
                        let sql = "UPDATE stats SET trades = " + userTrades + " WHERE userID = " + id;
                        console.log(sql)
                        database.query(sql, function (error) {
                            if (error) {
                                console.log("Error #32", error)
                            } else {
                                // Stats tablaban a SPENT ertek frissitese
                                sql = "UPDATE stats SET spent = " + userSpent + " WHERE userID = " + id;
                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log("Error #33", error)
                                    }
                                });
                            }
                        });
                    }).catch(function (error) {
                        console.log("Error #31", error)
                    });

                }).catch(function (error) {
                    //ha hiba van a portfolio adatok lekeresevel
                    console.log("Error #27", error)
                });
            } else {
                // ha a felhasznalonak nincsen eleg tokenje
                console.log("nincs ra eleg tokened!")
            }
        }).catch(function (error) {
            // Ha hiba van a felhasznalo adatok lekeresevel
            console.log("Error #13", error)
        });
    } else {
        // Ha nulla van beirva osszegnek
        console.log("0 nál többet kell vegyél!")
    }
}

function sell(data) {
    // Felhasznalo jelenlegi vagyona
    let currentWealth = 0;
    // Ellenorzi hogy tobbet akar-e eladni mint 0
    if (data.amount > 0) {
        getInfo(session.userid).then(function (userdata) {
            let id = userdata[0].ID;
            getPortfolio(session.userid).then(function (result) {
                // Ha van mar feljegyzett vasarlasa a felhasznalonak
                if (result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].currency === coin) {
                            currentWealth = result[i].currencyValue;
                        }
                    }
                    // Ellenorzi hogy van-e ennyi mennyisegu valutad
                    if (data.amount <= currentWealth) {

                        data.amount = parseFloat(data.amount)
                        let currentValue = data.amount * price
                        let setto = currentWealth - data.amount
                        let setpair = parseFloat(result[0].pairValue) - currentValue

                        let sql = "UPDATE coins SET currencyValue =" + setto + ", pairValue =" + setpair + "WHERE userID = " + id + " AND currency = " + "'" + coin + "'" + " AND pair = " + "'" + pair + "'";

                        database.query(sql, function (error) {
                            if (error) {
                                console.log("Error #14", error)
                            } else {
                                let userTokens = userdata[0].token + currentValue;
                                sql = "UPDATE users SET token=" + userTokens + "WHERE ID = " + id;

                                database.query(sql, function (error) {
                                    if (error) {
                                        console.log("Error #15", error)
                                        console.log(">   [MySQL] baj van az eladas funkcioval")
                                    } else {
                                        // Ha eladtad az osszes ilyen valutadat, akkor torli azt a sort az adatbazisbol
                                        getPortfolio(session.userid).then(function (result) {
                                            for (let i = 0; i < result.length; i++) {
                                                if (result[i].currency === coin && result[i].currencyValue === 0) {
                                                    sql = "DELETE FROM coins WHERE currency = " + "'" + coin + "' AND userID = " + id;
                                                    console.log(sql)
                                                    database.query(sql, function (error) {
                                                        if (error) {
                                                            console.log("Error #25", error)
                                                        }
                                                    });
                                                }
                                            }
                                        }).catch(function (error) {
                                            console.log("Error #26", error);
                                        });
                                    }
                                });

                            }
                        });
                        getStatInfo(session.userid).then(function (result) {
                            let userTrades = result[0].trades;
                            userTrades += 1;
                            sql = "UPDATE stats SET trades = " + userTrades + " WHERE userID = " + id;
                            database.query(sql, function (error) {
                                if (error) {
                                    console.log("Error #35", error)
                                }
                            });
                        }).catch(function (error) {
                            console.log("Error #36", error)
                        })
                    } else {
                        console.log("Nincs ennyid a", coin, "valutából")
                    }
                } else {
                    console.log("Nincs", coin, "valutád")
                }
            }).catch(function (error) {
                //ha hiba van a portfolio adatok lekeresevel
                console.log("Error #16", error)
            });
        }).catch(function (error) {
            //ha hiba van a felhasznalo adatok lekeresevel
            console.log("Error #17", error)
        })
    } else {
        console.log("0 nal tobbet kell eladnod!");
    }
}

// adatbazis lekerdezesek
function getInfo(user) {
    return new Promise((resolve, reject) => {

        var sql = "SELECT * FROM users WHERE username = " + "'" + user + "' OR email = " + "'" + user + "'";

        database.query(sql, function (error, results) {
            if (error) {
                console.log("Error #18", error)
                return reject(">   [MySQL] nem inditottad el az xamppot!");
            } else {
                return resolve(results);
            }
        });
    });
}

function getStatInfo(user) {

    return new Promise((resolve, reject) => {
        getInfo(user).then(function (result) {
            let id = result[0].ID;
            let sql = "SELECT * FROM stats WHERE userID = " + id;
            database.query(sql, function (error, results) {
                if (error) {
                    console.log("Error #30", error)
                    return reject();
                } else {
                    return resolve(results);
                }
            });
        }).catch(function (error) {
            console.log("Error #29", error)
        })

    });

}

// uj felhasznalo regisztralasa
function registerUser(username, password, email) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT username FROM users WHERE username =" + "'" + username + "'";

        database.query(sql, function (error, results) {
            if (error) {
                console.log("Error #19", error)
                return reject(error);
            } else {
                // ha meg nem letezik ilyen felhasznalo es az adatok megfelelnel a kovetelmenyeknek
                if (results.length === 0 && username.length > 3 && password.length > 7) {
                    let pfpNumber = Math.floor((Math.random() * 5) + 0);
                    let pfp = "default-" + pfpNumber;
                    // felhasznalo letrehozasa a users tablaban 10 000 alap tokennel
                    let sql = "INSERT INTO users(username, email, password, token, pfp) VALUES (" + "'" + username + "'" + "," + "'" + email + "'" + ", '" + password + "'" + "," + "'" + initialValue + "'" + "," + "'" + pfp + "'" + ")";

                    database.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error #20", error)
                            return reject(error);
                        } else {
                            console.log(">   [MySQL] user", username, "has been registered!");
                            return resolve(results);
                        }
                    });

                    getInfo(username).then(function (result) {
                        let id = result[0].ID;
                        sql = "INSERT INTO stats (userID) VALUES(" + "'" + id + "'" + ")";
                        database.query(sql, function (error, results) {
                            if (error) {
                                console.log("Error #28", error);
                            }
                        });
                    });

                } else {
                    console.log(">   [MySQL] user", username, "already exists!");
                    return reject("user '" + username + "' already exists!");
                }
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
                    console.log("Error #21", error)
                    console.log(">   [MySQL] valami baj van a portfolio lekeresevel a coins tablaban");
                } else {
                    return resolve(results);
                }
            });
        }).catch(function (error) {
            return reject();
            console.log("Error #24", error)
        });
    });
}

function changePassword(username, oldPassw, newPassw, email) {
    return new Promise((resolve, reject) => {
        getInfo(username).then(function (result) {
            if (result[0].password === oldPassw) {
                if (result[0].email === email) {
                    let sql = "UPDATE users SET password = " + "'" + newPassw + "'" + " WHERE username = " + "'" + username + "'" + " AND email = " + "'" + email + "'";
                    console.log(sql)
                    database.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error #22", error)
                            console.log(">   [MySQL] valami baj van a portfolio lekeresevel a coins tablaban");
                        } else {
                            return resolve(results);
                        }
                    });
                } else {
                    // Ha nem jo az email cim
                    return reject("This email doesn't match the email connected with that profile.")
                }
            } else {
                // Ha nem jo a jelszo
                return reject("Wrong password.");
            }
        }).catch(function (error) {
            console.log("Error #23", error)
        });
    });
}
const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
var productsRouter = require('./routes/vechical');
var config = require('./config');

const bodyParser = require('body-parser');
var requestIp = require('request-ip');

const app = express();

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db
});
connection.connect(function(error) {
    if (!!error) console.log(error);
    else console.log('Database Connected!');
});

app.use('/vehicle', verifyToken, productsRouter);

app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the API'
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the API'
    });
});
app.use(bodyParser.json());

app.post('/api/posts', verifyToken, (req, res) => {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'Post created...',

            });
        }
    });
});

app.post('/api/login', (req, res) => {
    // Mock user
    var clientIp = requestIp.getClientIp(req);
    var successd = 0;
    const username = req.body.username;
    const password = req.body.password;

    if (username == "" && password == "") {
        res.json({
            msg: 'User Name & Password Reuired',
            user: '',
            token: '',

        });
    }

    var sql = 'SELECT * FROM ?? WHERE username = ? AND password = ?';
    var tbl = 'users';
    var query = connection.query(sql, [tbl, username, password], (err, results, fileds) => {
        console.log(results);
        if (err) {
            res.json({
                msg: err,
                user: '',
                token: '',
            });
        } else {
            const user = results;
            if (user != "") {
                successd = 1;

                jwt.sign({ user }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
                    // res.json({
                    //     token
                    // });

                    if (user != "") {

                        var sql = `INSERT INTO log_master (requesting_ip, username,password,success_fail,token) VALUES ("${clientIp}", "${username}", "${password}","${successd}","${token}")`;
                        connection.query(sql, function(err, result) {
                            if (err) {
                                res.status(500).send({ error: 'Something failed!' })
                            }

                        })
                        res.json({
                            msg: 'Login Success Fully !!!',
                            user: results,
                            token
                        });
                    } else {

                    }
                });
                // res.json({ 'status': 1, 'data': results });
            } else {
                successd = 0;
                var token = '';
                var sql = `INSERT INTO log_master (requesting_ip, username,password,success_fail,token) VALUES ("${clientIp}", "${username}", "${password}","${successd}","${token}")`;
                connection.query(sql, function(err, result) {
                    if (err) {
                        res.status(500).send({ error: 'Something failed!' })
                    }

                })
                res.json({
                    msg: 'User Not Found !!!',
                    user: '',
                    token: '',
                });
            }
        }

    });

    // let sql = `SELECT * FROM users where username= ${username} and password= ${password} `;
    // let query = connection.query(sql, (err, rows) => {
    //     if (err) {
    //         res.json({
    //             title: err,

    //         });
    //     } else {

    //         res.json({
    //             title: 'Login Not Success Fully !!!',
    //             user: rows[0],
    //         });
    //         const user = rows[0];
    //         jwt.sign({ user }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
    //             // res.json({
    //             //     token
    //             // });

    //             if (user != "") {
    //                 res.json({
    //                     title: 'Login Success Fully !!!',
    //                     user: rows[0],
    //                     token
    //                 });
    //             } else {

    //             }
    //         });
    //     }

    // });



});


function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}



app.listen(5000, () => console.log('Server started on port 5000'));


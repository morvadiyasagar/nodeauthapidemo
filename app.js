const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');


const app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'noderestapi'
});
connection.connect(function(error) {
    if (!!error) console.log(error);
    else console.log('Database Connected!');
});


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

    const username = req.body.username;
    const password = req.body.password;

    var sql = 'SELECT * FROM ?? WHERE username = ? AND password = ?';
    var tbl = 'users';
    var query = connection.query(sql, [tbl, username, password], (err, results, fileds) => {
        console.log(results);
        if (err) {
            res.json({
                title: err,

            });
        } else {
            const user = results;
            if (user != "") {
                jwt.sign({ user }, 'secretkey', { expiresIn: '24h' }, (err, token) => {
                    // res.json({
                    //     token
                    // });

                    if (user != "") {
                        res.json({
                            title: 'Login Success Fully !!!',
                            user: results,
                            token
                        });
                    } else {

                    }
                });
                // res.json({ 'status': 1, 'data': results });
            } else {
                res.json({
                    title: 'Login Not  Success Fully !!!',

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
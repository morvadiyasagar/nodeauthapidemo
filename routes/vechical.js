var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var http = require('http');
var bodyParser = require('body-parser');
var cookies = require('cookie-parser');
router.use(cookies());
const https = require('https');
var requestIp = require('request-ip');


router.use(bodyParser.json()); // for parsing application/json

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'noderestapi'
});
connection.connect(function(error) {
    if (!!error) console.log(error);

});
/* GET users listing. */


/*post method for create product*/
router.post('/create', function(req, res, next) {




    var list = [];

    mystring = req.body.vechicalno.replace('[', '');
    mystring = mystring.replace(']', '');
    array = mystring.split(",");

    var home_url = 'https://parivahan.gov.in/rcdlstatus/';
    var post_url = 'https://parivahan.gov.in/rcdlstatus/vahan/rcDlHome.xhtml';


    //array[0].substring(0,3);
    first = "MH02CL";
    second = "0555";
    var bar = new Promise((resolve, reject) => {

        for (var i = 0; i < array.length; i++) {

            var vechicalno = array[i].substring(1, array[i].length - 1);


            var sql1 = 'SELECT * FROM ?? WHERE vechical_no = ?';
            var tbl = 'vechicalinfo';

            var query = connection.query(sql1, [tbl, vechicalno], (err, results, fileds) => {
                console.log(results);
                if (err) {
                    console.log(err);
                } else {


                    cnt = results.length;


                    if (cnt > 0) {
                        if (results[0].company == "Tata") {
                            var rsult = {};
                            rsult['vechical_no'] = results[0].vechical_no;
                            rsult['data'] = 'Not Allowed';

                            list.push(rsult);

                        } else {
                            var rsult = {};
                            rsult['vechical_no'] = results[0].vechical_no;
                            rsult['chase_no'] = results[0].chase_no;
                            rsult['company'] = results[0].company;
                            rsult['model'] = results[0].model;
                            list.push(rsult);

                        }
                        console.log("list", list);



                    } else {
                        var rsult = {};
                        rsult['vechical_no'] = vechicalno;
                        rsult['data'] = 'Data Not Found';

                        list.push(rsult);
                    }
                }
            });
            if (i == array.length - 1)
                resolve();
        }
        console.log('for list', list);
    });

    bar.then(() => {
        console.log("bar then", list);
        res.json({
            msg: list
        });
    });

    return res.send(list);

    console.log('till here')
        // const request = require('request');



    // request(home_url, function(error, response, body) {
    //     console.error('error:', error); // Print the error if one occurred
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     console.log('body:', body); // Print the HTML for the Google homepage.
    //     res.json({
    //         message: response
    //     });

    // });

    // let data = '';
    // let viewstate = '';
    // var request = https.get(home_url, (res) => {
    //     console.log('statusCode:', res.statusCode);
    //     console.log('headers:', res.headers);
    //     console.log('cookies:', res.Cookie);

    //     res.on('data', (d) => {

    //         process.stdout.write(d);
    //         // soup = BeautifulSoup(d, 'html.parser')

    //         // viewstate = soup.select('input[name="javax.faces.ViewState"]')[0]['value']

    //     });
    //     console.log(viewstate);

    // }).on('error', (e) => {
    //     console.error(e);
    // });









});

router.post('/subscribe', function(req, res, next) {
    var array = [];
    var opration = [];
    var url = "";
    var list = [];
    mystring = req.body.vechicalno.replace('[', '');
    mystring = mystring.replace(']', '');
    mystring = mystring.replace("'", "");

    opration = req.body.opration.replace('[', '');
    opration = opration.replace(']', '');
    opration = opration.replace("'", "");
    console.log(mystring, opration);
    var clientIp = requestIp.getClientIp(req);
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];

    array = mystring.split(",");
    opration = opration.split(",");
    url = req.body.url;

    var sql = `INSERT INTO subscribe_log (requesting_ip, requested_token,number_list,opration_list,url) VALUES ("${clientIp}", "${bearerToken}", "${req.body.vechicalno}","${req.body.opration}","${url}")`;
    connection.query(sql, function(err, result) {
        if (err) {
            res.status(500).send({ error: 'Something failed!' })
        }

    })
    var bar = new Promise((resolve, reject) => {
        var i = 0;

        for (i = 0; i < array.length; i++) {

            for (var j = 0; j < opration.length; j++) {
                var cnt = 0;
                var urlinfo = '';
                if (i == 0) {
                    var ayy = array[i].substring(0, array[i].length - 1);
                } else {
                    var ayy = array[i].substring(1, array[i].length - 1);
                }
                if (j == 0) {
                    var opp = opration[j].substring(0, opration[j].length - 1)

                } else {
                    var opp = opration[j].substring(1, opration[j].length - 1)

                }

                var sql1 = 'SELECT * FROM ?? WHERE vechical_no = ? AND opration = ?';
                var tbl = 'subscribe_detalis';
                var query = connection.query(sql1, [tbl, ayy, opp], (err, results, fileds) => {
                    console.log(results);
                    if (err) {
                        console.log(err);
                    } else {


                        cnt = results.length;

                        if (cnt > 0) {
                            console.log('from here' + results[0].url);
                            var rsult = {};
                            rsult['url'] = results[0].url;
                            rsult['opration'] = opp;
                            rsult['vechicalno'] = ayy;
                            list.push(rsult);

                            var rsult = {};
                            rsult['url'] = url;
                            rsult['opration'] = opp;
                            rsult['vechicalno'] = ayy;
                            list.push(rsult);
                            console.log("sdfd", list.length, list);
                        } else {

                            var sql = `INSERT INTO subscribe_detalis (vechical_no, opration, url) VALUES ("${ayy}", "${opp}", "${url}")`;
                            connection.query(sql, function(err, result) {
                                if (err) {
                                    res.status(500).send({ error: 'Something failed!' })
                                }

                            })
                        }
                    }
                })
            }

        }
    });

    bar.then(() => {
        console.log("form listinfo");
        console.log("finallist" + list);
        // if (i == array.length) {
        console.log('list' + i)
        res.json({
            msg: "Successfully Subscribe",
            data: list
        });
        // } else {
        //     res.json({
        //         msg: "Successfully Subscribed",
        //         data: list
        //     });
        // }
    });




});

router.get('/getcall', function(req, res, next) {
    var clientIp = requestIp.getClientIp(req);
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];

    var totalurl = 0;
    var sql1 = 'SELECT * FROM ??';
    var tbl = 'subscribe_detalis';
    var query = connection.query(sql1, [tbl], (err, results, fileds) => {
        console.log(results);
        if (err) {
            console.log(err);
        } else {
            totalurl = results.length;
            for (i = 0; i < results.length; i++) {



                var request = https.get(results[i].url, (res) => {

                    console.log('statusCode:', res.statusCode);
                    console.log('headers:', res.headers);
                    console.log('cookies:', res.Cookie);

                    res.on('data', (d) => {

                        process.stdout.write(d);



                    });


                }).on('error', (e) => {
                    console.error(e);
                });
            }
        }
    });
    var sql = `INSERT INTO call_log_detalis (requesting_ip, requested_token,no_url) VALUES ("${clientIp}", "${bearerToken}", "${totalurl}")`;
    connection.query(sql, function(err, result) {
        if (err) {
            res.status(500).send({ error: 'Something failed!' })
        }

    })

    return res.status(200).send({ msg: "success" });


});
//router.post('/subscribe', function(req, res, next) {});


module.exports = router;
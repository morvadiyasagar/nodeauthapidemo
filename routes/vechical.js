var express = require('express');
var router = express.Router();
const mysql = require('mysql');
var http = require('http');
var bodyParser = require('body-parser');
var cookies = require('cookie-parser');
router.use(cookies());
const https = require('https');
var requestIp = require('request-ip');
const { isNullOrUndefined } = require('util');
var config = require('../config');

router.use(bodyParser.json()); // for parsing application/json

const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db
});
connection.connect(function(error) {
    if (!!error) console.log(error);

});
/* GET users listing. */


/*post method for to get vehicle info*/
router.post('/vehicle_info', function(req, res) {

    var list = [];
    var db_data = [];
    //fetch data from request parameter
    vehicle_list = req.body.vechicalno;
    
    let ret_array = {};
    var pro_work = new Promise((resolve,reject)=>{
        var sql1 = 'SELECT * FROM ??';
        var tbl = 'vechicalinfo';

        var query = connection.query(sql1, [tbl], (err, results, fileds) => {
            // console.log(query);
            if (err) {
                console.log(err);
            } else {
                results.forEach(element => {
                    console.log(element);
                    // tmp = [];
                    db_data[element.vechical_no] = {
                        "vechical_no":element.vechical_no,
                        "company":element.company,
                        "model":element.model,
                        "chassis_no":element.chase_no,
                    };
                });
                console.log('db_data',db_data);
                vehicle_list.forEach(vehicle_no => {
                    console.log(isNullOrUndefined(db_data[vehicle_no]));
                    if(!isNullOrUndefined(db_data[vehicle_no])){
                        console.log('comapany info of',vehicle_no,db_data[vehicle_no]['company']);
                        if(db_data[vehicle_no]['company'] == "Tata"){
                            ret_array[vehicle_no] = {"status":"error","msg":"Not allowed"};
                        }else{
                            ret_array[vehicle_no] = db_data[vehicle_no];
                        }
                    }else{
                        ret_array[vehicle_no] = {"status":"error","msg":"vehicle inforamtion not available"};
                    }
                });
                console.log('ret val: ',ret_array);
                resolve(ret_array);
            }
        });
    });
    pro_work.then((r)=>{
        console.log('from then ret ',ret_array);
        ret_array = r;
       console.log(typeof(ret_array));
        res.json(r);
        console.log('json',ret_array);
    });
});

router.post('/subscribe', function(req, res) {
    var array = [];
    var opration = [];
    var url = "";
    var list = {};
    mystring = req.body.vechicalno;
    

    opration = req.body.opration;
    
    var clientIp = requestIp.getClientIp(req);
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];

    array = mystring;
    url = req.body.url;

    var sql = `INSERT INTO subscribe_log (requesting_ip, requested_token,number_list,opration_list,url) VALUES ("${clientIp}", "${bearerToken}", "${req.body.vechicalno}","${req.body.opration}","${url}")`;
    connection.query(sql, function(err, result) {
        if (err) {
            res.status(500).send({ error: 'Something failed!' })
        }

    });
    var bar = new Promise((resolve, reject) => {
        var i = 0;
        console.log('array lenght', array.length);
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

                // var sql1 = 'SELECT * FROM ?? WHERE vechical_no = ? AND opration = ?';
                // var tbl = 'subscribe_detalis';
                // var query = connection.query(sql1, [tbl, ayy, opp], (err, results, fileds) => {
                //     console.log('query output' , results);
                //     if (err) {
                //         console.log(err);
                //     } else {


                        // cnt = results.length;

                        // if (cnt > 0) {
                        //     console.log('from here' + results[0].url);
                        //     var rsult = {};
                        //     rsult['url'] = results[0].url;
                        //     rsult['opration'] = opp;
                        //     rsult['vechicalno'] = ayy;
                        //     list.push(rsult);

                        //     var rsult = {};
                        //     rsult['url'] = url;
                        //     rsult['opration'] = opp;
                        //     rsult['vechicalno'] = ayy;
                        //     list.push(rsult);
                        //     console.log("sdfd", list.length, list);
                        // } else {

                            var sql = `INSERT INTO subscribe_detalis (vechical_no, opration, url) VALUES ("${ayy}", "${opp}", "${url}")`;
                            connection.query(sql, function(err, result) {
                                if (err) {
                                    res.status(500).send({ error: 'Something failed!' })
                                }else{
                                    console.log('insert result',result);
                                }

                            });
                        // }
                    // }
                // });
            }
            if(i==array.length - 1)
            resolve();
        }
    });

    bar.then(() => {
        console.log("form listinfo");
        console.log("finallist" + list);
        // if (i == array.length) {
        // console.log('list' + i)
        res.json({
            msg: "Successfully Subscribe",
            // data: list
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
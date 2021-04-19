const express = require('express')
const bodyParser = require("body-parser");
const app = express();

const port = 80;
const request = require('request');
const querystring = require('querystring');

var mysql = require('mysql');

var pool = mysql.createPool({
    host        : 'localhost',
    port        : 3306,
    database    : 'ListeningCorner',
    user         : 'root',
    password    : '**'
});

let https = require("https");
let fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));

// 配置 https
const httpsOption = {
    key : fs.readFileSync("./https/5476753_webdev.wbingzhang.com.key"),
    cert: fs.readFileSync("./https/5476753_webdev.wbingzhang.com.pem")
}

//解决跨域问题
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to WBZ\'s hub! This is my first web page!\n\n     **' +
        '****       ******     \n   **********   *********   \n ************* ******' +
        '*******\n*****************************\n*****************************\n**********I love LY**********\n ***' +
        '************************ \n   ***********************   \n     *******************     \n       **********' +
        '*****       \n         ***********         \n           *******           \n             ***             \n   ' +
        '           *              ')
})

app.get('/getcode', (req, res) => {
    console.log(req.query) //查看请求的body里面的内容
    var data = {
        'appid': 'wxe3f92675f08ec6e0',
        'secret': '9d5e435894144b831db0a726e20f614a',
        'js_code': req.query.code,
        'grant_type': 'authorization_code'
    };
    console.log(data);
    // querystring的stringify用于拼接查询
    var content = querystring.stringify(data);
    // 根据微信开发者文档给的API
    var url = 'https://api.weixin.qq.com/sns/jscode2session?' + content;
    // 对url发出一个get请求
    request.get({
        'url': url
    }, (error, response, body) => {
        // 将body的内容解析出来
        let result = JSON.parse(body);
        result.code = req.query.code;
        console.log(result)
        let sql = `select * from user_info where openid='${result.openid}'`;
        console.log(sql)
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows) {
                if (err) {
                    console.log('err:', err.message);
                }else {
                    if (rows.length == 0){
                        let sql = `insert into user_info(openid) values('${result.openid}')`;
                        console.log(sql)
                        connection.query(sql, function (err, rows) {
                            if (err) {
                                console.log('err:', err.message);
                            }else {
                                console.log(rows);
                                result.id = rows.insertId;
                                result.userid = null;
                                console.log(result);
                                res.json(result)
                            }

                        });
                    }else {
                        console.log(rows);
                        result.id = rows[0].id;
                        result.userid = rows[0].userid;
                        console.log(result);
                        res.json(result)
                    }
                }
            });
            connection.release();
        });
    })
});


app.post('/abc', function (req, res) {
    var user_name=req.body.username;
    console.log(user_name)
    res.send('Got a POST request: username='+user_name)
})

//配置服务端口80 443

var server = app.listen(80, function () {
    var port = server.address().port;
    console.log('App listening at %s', port);
})

https.createServer(httpsOption, app).listen(443);
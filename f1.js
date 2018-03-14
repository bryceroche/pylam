
var whitelist = require('./whitelist.js')
var cors = require('cors')
var list = whitelist.Whitelist();
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var hello = require('./hello.js');
var getWebReports = require('./getwebreports.js');
var twilio_module = require('./twilio.js');
var pug = require('pug');
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var twilio = require('twilio');
var AWS = require('aws-sdk');
var adri = require('./getWebreports_DL.js')
var urlCrypt = require('url-crypt')('~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
const base64url = require('base64-url');

app.use(cors());
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

//const compiledFunction = pug.compileFile('index.pug');
const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'adriras.crk1o9ha4m4n.us-west-2.rds.amazonaws.com',
    user: 'adridba',
    password: 'Adr15ys!mysql',
    database: 'chatbot',
    multipleStatements: true
});


conn.connect((err) => {
    if (err) throw err;
    console.log('Connected! to the database 4');
});

console.log(__dirname + '/public');

app.get('/', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('lp.html', { root: __dirname })
})

function encrypt(data) { return urlCrypt.cryptObj(data); }
function decrypt(data) { return urlCrypt.decryptObj(data); }

server.listen(3000, () => console.log('Server running on port 3000'))
server.timeout = 5000;

io.on('connection', function (client, res) {
    console.log('Client connected...');

    client.on('join', function (data) {
        var theid;
        theid = data;
        hello.get_user_idv3(conn, functionfour, theid);
    });

    client.on('call_person', function (data) {
        console.log('inside call_person function');
        console.log(data);
        twilio_module.twilio_send_text(data);
    });

    client.on('getreportdata', function (data) {
        sendtoreportsclient(data);
    });

    client.on('submitUser', function (data) {
        data.personcode = encrypt(data.personcode);
        console.log('in submitUser');
        console.log(data);
        hello.add_user(conn, throw_query_at_db, data.email, data.name, data.personcode);
    });


    function functionfour(err, data) {
        console.log('in the functionfour');
        client.emit('updatelabel', data);
    }
    function functionTwo(error, data) {
        client.emit('updatelabel', data);
    }
    function sendtoreportsclient(data) {
        client.emit('recieve_reports', data);
    }
    function setkeypeople(conn, theid, thekey) {
        var sql = "update demo_people set encrypted = '" + thekey + "' where personid = " + theid + "";
        
        conn.query(sql, (err, result, fields) => {
            if (err) {
                console.log('setkeypeople failed');
                return console.error(err.message);
            };
            console.log(result.affectedRows + " record(s) updated");
        });
    };
    function throw_query_at_db(conn) {
        conn.query('select personid from demo_people where encrypted is null', function (err, rows, fields) {
            console.log('in throw_query1');
            for (var i = 0; i < rows.length; i++) {
                console.log('throw_query working');
                console.log(i);
                theid = rows[i].personid;
                setkeypeople(conn, theid, encrypt(theid));
            }           
        });
        conn.query('CALL sp_update_tables()', (err, rows, fields) => {
            console.log('in throw_query2');
            for (var i = 0; i < rows.length; i++) {
                console.log('throw_query2 working');
                console.log(i);
                theid = rows[i].personid;
            }   
            buildEmail(conn);
        });
    };
    function buildEmail(conn) { //let sql = `CALL sp_get_email(?)`;
        var sql = 'select fullname, emailaddress, encrypted from demo_people where emailed is null';
        //var sql = 'CALL sp_build_email';
        console.log('in buildEmail');
        conn.query(sql, (error, results, fields) => {
            if (error) {
                console.log('buildEmail failed');
                return console.error(error.message);
            }
            for (var i in results) {
                var result = results[i];
                console.log(result['emailaddress']);
                sendEmail(result['emailaddress'], result['fullname'], result['encrypted']);
            }
            updateSent(conn);
        });
    };
    function sendEmail(theemail, thename, thekey) {
        console.log('in sendEmail');
        var markup = 'Hi ' + thename + '!  Please follow the link to update us your current availability. We have exciting jobs all over the USA and these jobs are also updated constantly. Audrey our virtual assistant will help you update us, your availability, communication preferences and if you are not available, we can note down when to contact you later.  Thanks for your time.  <a class="ulink" href="http://chat.adri-hr.com?id=' + thekey + '" target="_blank">Link to Audrey</a>';
        var transporter = nodemailer.createTransport(ses({
            accessKeyId: 'AKIAIGVJSH44VJLXCLOA',
            secretAccessKey: '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'
        }));

        var mailOptions = {
            from: 'support@adri-sys.com',
            to: theemail,
            //cc: 'support@adri-sys.com',
            subject: 'ADRI Link',
            html: markup
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
     
    };
    function updateSent(conn) {
        console.log('in updateSent');
        var sql = `UPDATE chatbot.demo_prospects SET emailed=0`;
        conn.query(sql, (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            console.log('process complete');
        });
    };
});


function functionOne(x) { console.log(x); }

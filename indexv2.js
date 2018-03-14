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
var formidable = require('formidable');
var fs = require('fs');

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

app.get('/newuser', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('newUser.html', { root: __dirname })
})

app.get('/Audrey', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('lp.html', { root: __dirname })
})

app.get('/Dashboard', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('dash.html', { root: __dirname })
})
function random (low, high) {
    return Math.random() * (high - low) + low;
}

function dead_end(){
    console.log('dead_end');
}
function read_delete_file(filename){

fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  console.log(data);
  fs.unlink(filename, dead_end);
});
}

app.get('/Actions', (req, res) => {
    console.log('inside actions');
    res.sendFile('act.html', { root: __dirname });

    console.log('attempt to run python routine...');

    random_filename = random(1, 1000000);
    var filename1 = '/home/ubuntu/pylam/' + random_filename.toString() + '.txt';
    var spawn = require("child_process").spawn;
    var pythonProcess = spawn('python',["/home/ubuntu/pylam/seq.py", [1,2,3], 45, random_filename]);

    pythonProcess.stdout.on('data', function (data){
      console.log('python routine returned!');
      read_delete_file(filename1);
    console.log(data.toString('utf8'));

    });
})

app.get('/Metrics', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('met.html', { root: __dirname })
})

app.get('/Settings', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('sett.html', { root: __dirname })
})

app.get('/Main', (req, res) => {
    console.log('inside the main endpoint -hey! 1');
    res.sendFile('main.html', { root: __dirname })
})

app.post('/fileupload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = '/home/ubuntu/files/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.sendFile('act_post.html', { root: __dirname })
        });
    });
});


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

    client.on('join_dash', function (data) {
        console.log(data);
        newUser.get_missed_location(return_dash);
    });

    client.on('join_sett', function (data) {
        console.log(data);
        newUser.get_interviewstuff(return_sett);
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
        newUser.add_user(conn, newUser.update_encrpyted_field, data.email, data.name, data.personcode);

    });


    function return_sett(err, data) {
        console.log('in the return_dash');
        client.emit('update_sett', data);
    }
    function return_dash(err, data) {
        console.log('in the return_dash');
        client.emit('update_dash', data);
    }
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

});

var newUser = {
    get_missed_location: function (callback) {
        console.log('in the get_missed_location');
        conn.query('select * from demo_missed_location', function (err, rows, fields) {

    callback(err, rows);

});
    },
    get_interviewstuff: function (callback) {
        console.log('in the get_interviewstuff');
        conn.query('select * from vinterview', function (err, rows, fields) {

            callback(err, rows);

        });
    },
    add_user: function (conn, callback, email, name, code) {
        console.log('inside the add_user');

        var sql = conn.query('call sp_newuser(?, ?, ?)', [email, name, code], function (err, result) {
            if (err) throw err;
            callback(err, result, newUser.buildEmail, email);
        });
    },
    update_encrpyted_field: function (err, result, callback, email) {
        console.log('in the update_encrpyted_field');
        conn.query('select personid from demo_people where encrypted is null', function (err, rows, fields) {
            for (var i = 0; i < rows.length; i++) {
                theid = rows[i].personid;
                newUser.setkey(theid, encrypt(theid));
            }
            callback(err, rows, email);

        });
    },
    setkey: function (theid, thekey) {
        var sql = "update demo_people set encrypted = '" + thekey + "' where personid = " + theid + "";
        console.log(sql);
        conn.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
        });
    },
    buildEmail: function (err, rows, email) {
        console.log('in the buildEmail');
        console.log(email);

        var sql = conn.query('call sp_buildemail(?)', [email], function (error, results) {

            if (error) {
                console.log('buildEmail failed');
                return console.error(error.message);
            }
            newUser.sendEmail(results[0][0].emailaddress, results[0][0].fullname, results[0][0].encrypted);
        });
    },
    sendEmail: function (theemail, thename, thekey) {
        console.log('in sendEmail');
        console.log(theemail);
        console.log(thename);
        console.log(thekey);


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
        transporter.newUser.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + theemail);
                updatesent(theemail);
                newUser.sendEmailadri(theemail, thename)
            }
        });

    },
    sendEmailadri: function (theemail, thename) {
        console.log('in sendEmailadri');
        console.log(theemail);
        console.log(thename);


        var markup = 'This person just registered ....  ' + thename + ' with this email address ... ' + theemail + '';
        var transporter = nodemailer.createTransport(ses({
            accessKeyId: 'AKIAIGVJSH44VJLXCLOA',
            secretAccessKey: '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'
        }));

        var mailOptions = {
            from: 'support@adri-sys.com',
            to: 'info@adri-sys.com',
            //cc: 'support@adri-sys.com',
            subject: 'ADRI Link',
            html: markup
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: info@adri-sys.com');

            }
        });

    },
    updatesent: function (emailaddress) {
        console.log('in updatesent');
        var sql = conn.query('call sp_updatesent(?)', [emailaddress], function (err, result) {
            if (err) throw err;
            //callback(err, result, emailaddress, thename);
        });
    }
};

function writelog() {
    console.log('the dead end');
}

function functionOne(x) { console.log(x); }

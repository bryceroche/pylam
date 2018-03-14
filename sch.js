
exports.get_schedule_answer = function (d, conn, callback) {
    console.log(d);
    var sql = conn.query('call sp_get_answer(?)', [d], function (error, results) {
        if (error) {
            console.log('get_schedule_answer failed');
            return console.error(error.message);
        }
        callback(error, results);
    });
}

exports.api_get_users = function (conn, callback) {
    console.log(d);
    var sql = conn.query('call api_get_users()', function (error, results) {
        if (error) {
            console.log('api_get_users failed');
            return console.error(error.message);
        }
        callback(error, results);
    });
}


exports.get_availability = function (d, conn, callback) {
    console.log(d);
    var sql = conn.query('call api_get_avail(?)', [d], function (error, results) {
        if (error) {
            console.log('get_availability failed');
            return console.error(error.message);
        }
        callback(error, results);
    });
}

exports.api_get_unscheduled = function (d, conn, callback) {
    console.log(d);
    var sql = conn.query('api_get_unscheduled(?)', [d], function (error, results) {
        if (error) {
            console.log('api_get_unscheduled failed');
            return console.error(error.message);
        }
        callback(error, results);
    });
}


exports.api_get_interview_info = function (d, conn, callback) {
    console.log(d);
    var sql = conn.query('call api_get_interview_info(?, ?, ?)', [d[0], d[1], d[2]], function (error, results) {
        if (error) {
            console.log('api_get_interview_info failed');
            return console.error(error.message);
        }
        callback(error, results);
    });
}

exports.getsequenceinterivew = function (mgrarray, interviewminutes, callback) {
    if (mgrarray.length < 2) {
        console.log('decline to answer the schedule question bc only one manager');
        callback(-1);
    }
    else {
        var rand = getRandomInt(100000000);
        var spawn = require("child_process").spawn;
        var dirpath = getdirpath() + 'seq.py';
        console.log(dirpath);

        var pythonProcess = spawn('python', [dirpath, mgrarray, interviewminutes, rand]);


        pythonProcess.stdout.on('data', function (data) {
            console.log('python getsequenceinterivew returned!');
            console.log(data.toString('utf8'));
            callback(rand);
        });
    }
}

exports.getpanelinterivew = function (mgrarray, interviewminutes, callback) {
    if (mgrarray.length < 2) {
        console.log('decline to answer the schedule question bc only one manager');
        callback(-1);
    }
    else {
        var rand = getRandomInt(100000000);
        var spawn = require("child_process").spawn;
        var dirpath = getdirpath() + 'panel.py';
        console.log(dirpath);
        var pythonProcess = spawn('python', [dirpath, mgrarray, interviewminutes, rand]);

        pythonProcess.stdout.on('data', function (data) {
            console.log('python getpanelinterivew returned!');
            console.log(data.toString('utf8'));
            callback(rand);
        });
    }
}

exports.getstandardinterivew = function (mgr, interviewminutes, callback) {
    var rand = getRandomInt(100000000);
    var spawn = require("child_process").spawn;
    var dirpath = getdirpath() + 'rng.py';
    console.log(dirpath);
    var pythonProcess = spawn('python', [dirpath, mgr, interviewminutes, rand]);

    pythonProcess.stdout.on('data', function (data) {
        console.log('python getstandardinterivew returned!');
        console.log(data.toString('utf8'));
        callback(rand);
    });
}

function getdirpath() {

    return "/home/ubuntu/pylam/";
    //return "/Users/bryceroche/desktop/pylam/";
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


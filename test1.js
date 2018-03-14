var AWS = require('aws-sdk');
var mysql = require('node_modules/mysql');
var adri = require('node_modules/adri-sys');
var sns = new AWS.SNS();
var ses = new AWS.SES({
    accessKeyId: 'AKIAJMAZA5BV7PR26HZA',
    secretAccesskey: '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',
    region: 'us-west-2'
});

function userTransform(u) {
    var phone = u.USER_PHONE || '';
    phone = phone.split(/[^0-9]/).join('');
    if (phone.charAt(0) == '1') {
        phone = phone.substr(1);
    }
    this.id = u.CANDIDATE_ID;
    this.fullname = u.USER_FNAME + ' ' + u.USER_LNAME;
    this.fname = u.USER_FNAME;
    this.lname = u.USER_LNAME;
    this.email = u.USER_EMAIL;
    this.phone = phone;
    this.position = u.POSITION_NAME;
    this.role = 'Candidate';
}

function convertTime(time) {
    if (time.period.toUpperCase() === 'PM' && time.hour != '12') {
        time.hour = (+time.hour + 12);
    }
    else {
        if (time.hour == '12') {
            time.hour == '00';
        }
    }
    return time.hour + ':' + time.minutes;
}

exports.update = function (event, context, callback) {
    var messages = {};
    var messageLog = [];
    var queuedIDs = [];
    var sendCount = 0;
    var totalMessages = 0;
    event = event.body;

    var uiid = event.uiID;
    var cliid = event.clientID;

    event.clientID = new Buffer(event.clientID, 'base64');
    event.userID = new Buffer(event.userID, 'base64');
    event.uiID = new Buffer(event.uiID, 'base64');

    var params = {
        'clientID': event.clientID,
        'userID': event.userID,
        'uiID': event.uiID
    };

    var info = [
        params.userID,
        event.info.fName,
        event.info.lName,
        event.info.email,
        event.info.phone,
        event.info.location,
        event.info.defaultInterviewMinutes,
        event.info.ranking,
        event.info.lunchMinutes
    ];

    var schedules = event.availability;
    var iSch = schedules.length;
    var schedule;
    var nSch;
    var sDay;
    var schRow = [];
    var schTable = [];
    var spCall = '';
    event.info.lunchMinutes = 60;

    for (var i = 0; i < iSch; i++) {
        schedule = schedules[i];
        nSch = schedule.length;
        for (var n = 0; n < nSch; n++) {
            sDay = schedule[n];

            sDay.schedule.startTime.hour = sDay.schedule.startTime.hour || '1';
            if (sDay.schedule.startTime.hour === '1' && sDay.schedule.startTime.period === 'AM') {
                sDay.schedule.startTime.hour = '10';
                sDay.schedule.startTime.minutes = '00';
                sDay.schedule.startTime.period = 'AM';
            }

            sDay.schedule.endTime.hour = sDay.schedule.endTime.hour || '1';
            if (sDay.schedule.endTime.hour === '1' && sDay.schedule.endTime.period === 'AM') {
                sDay.schedule.endTime.hour = '4';
                sDay.schedule.endTime.minutes = '00';
                sDay.schedule.endTime.period = 'PM';
            }

            sRow = [
                params.userID,
                sDay.day,
                convertTime(sDay.schedule.startTime),
                convertTime(sDay.schedule.endTime),
                event.info.defaultInterviewMinutes,
                event.info.ranking,
                convertTime(sDay.schedule.lunchTime),
                event.info.lunchMinutes
            ];
            spCall = 'CALL UPDATE_PERSISTENT_AVAILABILITY(' + mysql.escape(sRow) + ');';
            schTable.push(spCall);
        }
    }

    //all items are now in the schTable array
    schTable = schTable.join('');

    function procComplete(data) {
        addMessageTemplates('candidateMessage', data.candidateMessage);
        if (data.hasOwnProperty('queuedCandidates') && messages.candidateMessage.hasOwnProperty('Candidate')) {
            notifyCandidates(data);
        }
        else {
            callback(null, data);
        }
    }

    function addMessageTemplates(stage, rows) {
        var lim = rows[0].length;
        if (!messages[stage]) {
            messages[stage] = {};
        }

        for (var i = 0; i < lim; i++) {

            if (!messages[stage][rows[0][i].RECIPIENT_TYPE]) {
                messages[stage][rows[0][i].RECIPIENT_TYPE] = {};
            }

            messages[stage][rows[0][i].RECIPIENT_TYPE][rows[0][i].MESSAGE_TYPE] = {
                contents: rows[0][i].MESSAGE_CONTENTS,
                subject: rows[0][i].MESSAGE_SUBJECT,
                from: rows[0][i].MESSAGE_FROM
            };

        }
    }

    function notifyCandidates(data) {
        var lim = data.queuedCandidates[0].length;
        var user;
        var msg = messages.candidateMessage.Candidate;
        var u;

        totalMessages += lim;

        for (var i = 0; i < lim; i++) {
            user = data.queuedCandidates[0][i];
            queuedIDs.push(user.QUEUE_ID);
            u = new userTransform(user);
            console.log(u);
            if (msg.hasOwnProperty('Email')) {
                sendEmail(u, msg.Email, user.INTERVIEW_REFERENCE_ID);
            }

            if (msg.hasOwnProperty('sms')) {
                sendSMS(u, msg.sms, user.INTERVIEW_REFERENCE_ID);
            }

            sendCount++;
        }
    }

    function sendSMS(user, message, iref) {
        if (user.phone !== '') {
            totalMessages++;
            var mBody = message.contents.split('(@name)').join(user.fullname);

            function smsSent(err, data) {
                console.log(err);
                messageSent('sms', user.id, iref);
            }

            var params = {
                Message: message.contents,
                Subject: message.subject,
                PhoneNumber: '+1' + user.phone
            };

            sns.publish(params, smsSent);
        }
    }

    function sendEmail(user, message, iref) {
        totalMessages++;
        var uid = new Buffer(user.id).toString('base64');
        var iid = new Buffer(iref).toString('base64');
        var usrID = user.id;

        var iLink = '';
        var emlBody = '';

        var qString = '?iref=' + iid + "&uid=" + uid + '&cliid=' + cliid + '&uiid=' + uiid;

        var map = {
            'Candidate': {
                page: 'candidate'
            },
            'Interviewer': {
                page: 'rctrinfsys'
            },
            'Recruiter': {
                page: 'rctrinfsys'
            }
        };

        iLink = event.uiID + map[user.role].page + '.html' + qString;
        emlBody = message.contents;
        emlBody = emlBody.split('(@name)').join(user.fullname);
        emlBody = emlBody.split('(@link)').join(iLink);
        emlBody = emlBody.split('(@position)').join(user.position);

        var eParams = {
            Destination: {
                ToAddresses: [user.email]
            },
            Message: {
                Body: {
                    Html: {
                        Data: emlBody
                    }
                },
                Subject: {
                    Data: message.subject
                }
            },
            Source: message.from
        };

        ses.sendEmail(eParams, function (err, data) {
            if (err) { console.log(err); }
            else {
            }
            messageSent('email', usrID, iref);
        });
    }

    function messageSent(mtype, usrID, intID) {
        var dnow = new Date();
        var logInfo = [
            mtype,
            usrID,
            dnow,
            intID
        ];
        sendCount++;

        messageLog.push('(' + mysql.escape(logInfo) + ')');
        console.log(sendCount + ': ' + totalMessages);
        if (sendCount === totalMessages) {
            logAll();
        }
    }

    function logAll() {
        //for each email sent, put in log
        //for each candidate/ interview combo, delete from queue
        //then exit

        var logEmails = {
            name: 'loggedMessages',
            statement: 'INSERT INTO T_MESSAGING_LOG (MESSAGE_TYPE, MESSAGE_RECIPIENT_ID, SEND_DATE_TIME, INTERVIEW_REFERENCE_ID) VALUES ' + messageLog.join(',') + ';',
            params: []
        };

        var queueCandidates = {
            name: 'queuedCandidates',
            statement: 'DELETE FROM T_QUEUED_CANDIDATE_POSITIONS WHERE QUEUE_ID IN (' + mysql.escape(queuedIDs) + ');',
            params: []
        };

        var logParams = {
            'clientID': event.clientID,
            'userID': event.userID,
            'uiID': event.uiID
        };

        var queries = [
            logEmails,
            queueCandidates
        ];

        adri.executeQuery(logParams, queries, logComplete);
    };

    function logComplete(data) {
        callback(null, 'DELETE FROM T_QUEUED_CANDIDATE_POSITIONS WHERE QUEUE_ID IN (' + mysql.escape(queuedIDs) + ');');
    }

    var primeQuery = {
        statement: 'CALL DELETE_PERSISTENT_AVAILABILITY(?);',
        params: [params.userID]
    };

    var paQuery = {
        statement: schTable,
        params: []
    };

    var infoQuery = {
        statement: 'CALL UPDATE_USER_INFO(?,?,?,?,?,?,?,?,?);',
        params: info
    };

    var queuedCandidates = {
        name: 'queuedCandidates',
        statement: 'CALL GET_QUEUED_CANDIDATES(?);',
        params: [params.userID]
    };

    var getCandidateMessage = {
        name: 'candidateMessage',
        statement: 'CALL GET_MESSAGES_FOR_STAGE(?);',
        params: ['New Interview']
    };

    var queries = [
        primeQuery,
        paQuery,
        infoQuery,
        queuedCandidates,
        getCandidateMessage
    ];

    adri.executeQuery(params, queries, procComplete);

};
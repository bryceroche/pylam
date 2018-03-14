function convertTime (time) {
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

exports.insert_db_avail = function (event, mgrid, conn) {
    var messages = {};
    var messageLog = [];
    var queuedIDs = [];
    var sendCount = 0;
    var totalMessages = 0;
    var uiid = event.uiID;
    var cliid = event.clientID;

    console.log(mgrid);

    event.clientID = new Buffer(event.clientID, 'base64');
    //event.userID = new Buffer(event.userID, 'base64');
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

    clear_old_rows(mgrid, conn);

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
                mgrid,
                sDay.day,
                convertTime(sDay.schedule.startTime),
                convertTime(sDay.schedule.endTime),
                event.info.defaultInterviewMinutes,
                event.info.ranking,
                convertTime(sDay.schedule.lunchTime),
                event.info.lunchMinutes
            ];
            schTable.push(sRow);
            insert_one_row(sRow, conn);
        }
    }
    return schTable;
};


function insert_one_row(d, conn){

  console.log(d);

  var sql = conn.query('call sp_set_hours(?,?,?,?,?,?,?,?)', [d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7]], function (error, results) {

  if (error) {
      console.log('insert_one_row failed');
      return console.error(error.message);
  }
  });
}


function clear_old_rows(d, conn){

  console.log(d);

  var sql = conn.query('call sp_avail_clear(?)', [d], function (error, results) {

  if (error) {
      console.log('clear_old_rows failed');
      return console.error(error.message);
  }
  });
}





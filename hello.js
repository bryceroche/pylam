exports.Hello = function (req, res) {

    var en_id = req.query.id;

    res.send('Hello World! new testing .... id = ' + req.query.id);

};

exports.throw_query_at_db = function (conn, res) {
    var pingList = [];

    conn.query('SELECT * FROM PING_ME', function (err, rows, fields) {
        if (err) {
            res.status(500).json({ "status_code": 500, "status_message": "internal server error" });
        } else {
            // Loop check on each row
            for (var i = 0; i < rows.length; i++) {

                // Create an object to save current row's data
                var ping_row = {
                    'PING_ID': rows[i].PING_ID,
                    'DAYS_LAG': rows[i].DAYS_LAG,
                    'PING_TIME': rows[i].PING_TIME,
                    'DATE_START': rows[i].DATE_START,
                    'DATE_END': rows[i].DATE_END
                }
                // Add object into array
                pingList.push(ping_row);

            }
            res.render('details', { "pingList": pingList });
        }
    });
    //conn.end();

};




exports.get_user_idv2 = function (conn, callback, theid) {
    console.log('inside the get_user_idv2');
    let sql = `CALL sp_user_qs(?)`;
    conn.query(sql, theid, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        callback(error, results[0][0]);
    });

};
exports.get_user_idv3 = function (conn, callback, theid) {
    console.log('inside the get_user_idv3');
    //let sql = `CALL sp_get_email(?)`;
    let sql = `CALL sp_get_email2(?)`;
    conn.query(sql, theid, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        callback(error, results[0][0]);
    });

};
exports.get_user_id = function (conn, callback, res, req) {
    console.log(req.query.id);
    let sql = `CALL sp_user_qs(?)`;
    conn.query(sql, req.query.id, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        callback(error, results[0][0]);
    });
};

exports.run_db_sp = function (conn, res) {

    conn.query('CALL SP_GETPING()', function (err, rows) {
        if (err) throw err;
        //res.sendFile('index.html', { root: __dirname });
        console.log('Data received from Db:\n');
        res.send(rows);
    });
};


exports.get_ten_events = function (conn, res, callback) {
    var events = [];
    conn.query('CALL SP_TEN_EVENTS()', function (err, rows) {
        if (err) {
            res.status(500).json({ "status_code": 500, "status_message": "internal server error" });
        } else {
            var row = rows[0];
            callback(row);
        }
    });

};

exports.go_to_son = function (conn, res) {

    conn.query('CALL SP_GETPING()', function (err, rows) {
        if (err) throw err;

        console.log('Data received from Db:\n');
        res.send(rows);
        //res.render('index', { layout : 'index', json: JSON.stringify(rows) });

    });
};



var http = require('http');
var loaddb = require('./loaddb.js');
var schedule = require('./sch.js');
var fs = require('fs');

var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Hello Http');

     //readthefile('/Users/bryceroche/desktop/pylam/test.json', functionfour);

    var interviewminutes = 45
    schedule.getsequenceinterivew([1234,104677], interviewminutes, functionfour24);
    schedule.getpanelinterivew([1234,104677], interviewminutes, functionfour24);
    schedule.getstandardinterivew([1234], interviewminutes, functionfour24);

});
server.listen(8080);

function functionfour24(data){
	console.log(data);
}

function readthefile(filename, callback){
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  console.log('OK: ' + filename);
  callback(JSON.parse(data));
});
}

function functionfour(data){
    abc = loaddb.insert_db_avail(data);
    console.log('hee');
    console.log(abc);

}

function myJsFunc1() {
     myJsFunc3();
     console.log(' myJsFunc1');
}
function myJsFunc2() {
  console.log(' myJsFunc2');
     myJsFunc3();
}

function myJsFunc3() {
    var x = document.getElementById("leftmenu_main");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function myCreateFunction() {
    var table = document.getElementById("myTable");
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = "NEW CELL1";
    cell2.innerHTML = "NEW CELL2";
}

function myDeleteFunction() {
    document.getElementById("myTable").deleteRow(0);
}

function generate_table(data) {
  // get the reference for the body
  var body = document.getElementById("content_main");
 
  // creates a <table> element and a <tbody> element
  var tbl = document.createElement("table");
  var tblBody = document.createElement("tbody");
 

 for(var i = 0; i < data.length; i++) {
    var row = document.createElement("tr");
    
	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].cand_name);
	cell.appendChild(cellText);
	row.appendChild(cell);

	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].cand_email);
	cell.appendChild(cellText);
	row.appendChild(cell);


	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].cand_code);
	cell.appendChild(cellText);
	row.appendChild(cell);

	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].managername);
	cell.appendChild(cellText);
	row.appendChild(cell);

		var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].mmg_email);
	cell.appendChild(cellText);
	row.appendChild(cell);

	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].cand_phone);
	cell.appendChild(cellText);
	row.appendChild(cell);


	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].rolename);
	cell.appendChild(cellText);
	row.appendChild(cell);

	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].city);
	cell.appendChild(cellText);
	row.appendChild(cell);


	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].interview_date);
	cell.appendChild(cellText);
	row.appendChild(cell);


	var cell = document.createElement("td");
	var cellText = document.createTextNode(data[i].interview_date_end);
	cell.appendChild(cellText);
	row.appendChild(cell);

    tblBody.appendChild(row);
}
 
  // put the <tbody> in the <table>
  tbl.appendChild(tblBody);
  // appends <table> into <body>
  body.appendChild(tbl);
  // sets the border attribute of tbl to 2;
  tbl.setAttribute("border", "1");
}

$(document).ready(function () {
	var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
    socket.on('connect', function(data) {
        socket.emit('join_sett', 'hello from sett client');
        
    });

    socket.on('update_sett', function (data) {
        console.log('in the update_dash');
        console.log(data);
        generate_table(data);
    });
});

















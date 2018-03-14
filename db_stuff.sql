



drop table if exists demo_people;
drop table if exists demo_roles;
drop table if exists demo_locations;
drop table if exists demo_job_openings;

create table demo_people ( 
	personid  int NOT NULL AUTO_INCREMENT, 
	fullname varchar(255) NOT NULL,
	locationid int null,
	roleid int null,
	emailaddress varchar(100)  NULL,
	mobilenumber varchar(55)  NULL,
	contacttime time NULL,
PRIMARY KEY (personid));



create table demo_roles ( 
	roleid  int NOT NULL AUTO_INCREMENT, 
	rolename varchar(255) NOT NULL,
	payrate int NULL,
	description varchar(255) null,
	skills varchar(255) null,
PRIMARY KEY (roleid));

create table demo_locations ( 
	locationid  int NOT NULL AUTO_INCREMENT, 
	city varchar(255) NOT NULL,
	state varchar(55)  NULL,
	zip varchar(20) NULL,
	country varchar(255) null,
	timezone varchar(100) null,
PRIMARY KEY (locationid));


create table demo_job_openings ( 
	openid  int NOT NULL AUTO_INCREMENT, 
	roleId varchar(255) NOT NULL,
	locationid int null,
	startdate datetime NULL,
PRIMARY KEY (openid));


insert into demo_locations ( city, state, zip, country) values("Los Angeles", "CA", "90266", "USA");
insert into demo_locations ( city, state, zip, country) values("Atlanta", "GA", "30308", "USA");
insert into demo_locations ( city, state, zip, country) values("Seattle", "WA", "98119", "USA");
insert into demo_locations ( city, state, zip, country) values("New York", "NY", "11365", "USA");
insert into demo_locations ( city, state, zip, country) values("Chicago", "IL", "60007", "USA");
insert into demo_locations ( city, state, zip, country) values("Houston", "TX", "77001", "USA");


insert into demo_roles ( rolename, payrate, description, skills) values("Labor", "20", "General Labor", "fit individual");
insert into demo_roles ( rolename, payrate, description, skills) values("Lawn", "20", "Lawn Care", "good work ethic");
insert into demo_roles ( rolename, payrate, description, skills) values("Contractor", "20", "General Contractor", "knowledgable");
insert into demo_roles ( rolename, payrate, description, skills) values("Branch Manager",  "20", "Branch Manager", "good experience");
insert into demo_roles ( rolename, payrate, description, skills) values("Branch Manager Jr.",  "20", "Branch Manager Junior", "little experience");
insert into demo_roles ( rolename, payrate, description, skills) values("Sales", "20", "Sales Rep", "personable");
insert into demo_roles ( rolename, payrate, description, skills) values("Sales Jr.", "20", "Sales Rep Junior", "personable");

insert into demo_job_openings ( roleid, locationid, startdate) values(1, 1, '2017-11-01');
insert into demo_job_openings ( roleid, locationid, startdate) values(2, 1, '2017-11-01');
insert into demo_job_openings ( roleid, locationid, startdate) values(3, 1, '2017-11-01');
insert into demo_job_openings ( roleid, locationid, startdate) values(4, 1, '2017-11-01');
insert into demo_job_openings ( roleid, locationid, startdate) values(5, 1, '2017-11-01');
insert into demo_job_openings ( roleid, locationid, startdate) values(6, 1, '2017-11-01');


insert into demo_job_openings ( roleid, locationid, startdate) values(1, 2, '2017-11-05');
insert into demo_job_openings ( roleid, locationid, startdate) values(2, 2, '2017-11-05');
insert into demo_job_openings ( roleid, locationid, startdate) values(3, 2, '2017-11-05');



insert into demo_job_openings ( roleid, locationid, startdate) values(1, 3, '2017-11-07');
insert into demo_job_openings ( roleid, locationid, startdate) values(2, 3, '2017-11-07');
insert into demo_job_openings ( roleid, locationid, startdate) values(3, 3, '2017-11-07');
insert into demo_job_openings ( roleid, locationid, startdate) values(4, 3, '2017-11-07');
insert into demo_job_openings ( roleid, locationid, startdate) values(5, 3, '2017-11-07');



select * from demo_people;
select * from demo_roles;
select * from demo_locations;
select * from demo_job_openings;
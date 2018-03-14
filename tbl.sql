



use chatbot;

drop table demo_hours;
CREATE TABLE `demo_hours` (
  `hour_id` int(11) NOT NULL AUTO_INCREMENT,
  `managerid` int(11) NOT NULL,
  `locationid` int(11) DEFAULT NULL,
  `weekday_id` int(11) DEFAULT NULL,
  `weekday` varchar(12) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `interview_length_minutes` int(11) DEFAULT '20',
  `interviewer_rank` int(11) DEFAULT NULL,
  `lunch_start` time DEFAULT NULL,
  `lunch_end` time DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`hour_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;

drop table demo_interview;
CREATE TABLE `demo_interview` (
  `interviewid` int(11) NOT NULL AUTO_INCREMENT,
  `roleid` int(11) DEFAULT NULL,
  `managerid` int(11) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL,
  `candidateid` int(11) DEFAULT NULL,
  `manager_survey_id` int(11) DEFAULT NULL,
  `candidate_survey_id` int(11) DEFAULT NULL,
  `int_status` varchar(12) DEFAULT NULL,
  `int_result` varchar(12) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  `enddate` datetime DEFAULT NULL,
  `loaddate` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedate` datetime DEFAULT NULL,
  `ical` int(11) DEFAULT NULL,
  PRIMARY KEY (`interviewid`),
  KEY `idx_interview` (`candidateid`,`locationid`,`roleid`)
) ENGINE=InnoDB AUTO_INCREMENT=230 DEFAULT CHARSET=latin1;


drop table demo_job_openings;
CREATE TABLE `demo_job_openings` (
  `openid` int(11) NOT NULL AUTO_INCREMENT,
  `roleid` varchar(255) NOT NULL,
  `managerid` int(11) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

drop table demo_locations;
CREATE TABLE `demo_locations` (
  `locationid` int(11) NOT NULL AUTO_INCREMENT,
  `city` varchar(255) NOT NULL,
  `state` varchar(55) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `timezone` varchar(100) DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`locationid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

drop table demo_managers;
CREATE TABLE `demo_managers` (
  `managerid` int(11) NOT NULL AUTO_INCREMENT,
  `personcode` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL,
  `roleid` int(11) DEFAULT NULL,
  `emailaddress` varchar(100) DEFAULT NULL,
  `mobilenumber` varchar(55) DEFAULT NULL,
  `contacttime` time DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`managerid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;


drop table demo_people;
CREATE TABLE `demo_people` (
  `personid` int(11) NOT NULL AUTO_INCREMENT,
  `personcode` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `emailaddress` varchar(100) DEFAULT NULL,
  `mobilenumber` varchar(55) DEFAULT NULL,
  `contacttime` time DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `emailed` int(11) DEFAULT NULL,
  `interested` varchar(10) DEFAULT NULL,
  `later_date` date DEFAULT NULL,
  PRIMARY KEY (`personid`),
  UNIQUE KEY `UC_email` (`emailaddress`)
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=latin1;



drop table demo_prospects;
CREATE TABLE `demo_prospects` (
  `personid` int(11) NOT NULL AUTO_INCREMENT,
  `personcode` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL,
  `roleid` int(11) DEFAULT NULL,
  `emailaddress` varchar(100) DEFAULT NULL,
  `mobilenumber` varchar(55) DEFAULT NULL,
  `contacttime` time DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `emailed` int(11) DEFAULT NULL,
  `encrypt_key` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`personid`)
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=latin1;


drop table demo_roles;
CREATE TABLE `demo_roles` (
  `roleid` int(11) NOT NULL AUTO_INCREMENT,
  `rolename` varchar(255) NOT NULL,
  `payrate` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`roleid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;




insert into chatbot.demo_hours SELECT * FROM RBSDEMO.demo_hours;
insert into chatbot.demo_interview SELECT * FROM RBSDEMO.demo_interview;
insert into chatbot.demo_job_openings SELECT * FROM RBSDEMO.demo_job_openings;
insert into chatbot.demo_locations SELECT * FROM RBSDEMO.demo_locations;
insert into chatbot.demo_managers SELECT * FROM RBSDEMO.demo_managers;
insert into chatbot.demo_people SELECT * FROM RBSDEMO.demo_people;
insert into chatbot.demo_prospects SELECT * FROM RBSDEMO.demo_prospects;
insert into chatbot.demo_roles SELECT * FROM RBSDEMO.demo_roles;
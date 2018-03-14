CREATE TABLE `demo_managers` (
  `managerid` int(11) NOT NULL AUTO_INCREMENT,
  `manager_type_id` int(11) DEFAULT NULL,
  `personcode` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `locationid` int(11) DEFAULT NULL,
  `roleid` int(11) DEFAULT NULL,
  `emailaddress` varchar(100) DEFAULT NULL,
  `mobilenumber` varchar(55) DEFAULT NULL,
  `contacttime` time DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `companyid` int(11) DEFAULT NULL,
  `default_interview_length` int(11) DEFAULT NULL,
  `interview_rank` int(11) DEFAULT NULL,
  `opt_out_email` int(11) DEFAULT NULL,
  `opt_out_sms` int(11) DEFAULT NULL,
  PRIMARY KEY (`managerid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

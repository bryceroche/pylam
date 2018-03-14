CREATE OR REPLACE VIEW chatbot.vinterview
AS
select
    `b`.`fullname` AS `cand_name`,
    `b`.`emailaddress` AS `cand_email`,
    `b`.`personcode` AS `cand_code`,
    `c`.`fullname` AS `managername`,
    `c`.`emailaddress` AS `mmg_email`,
    `b`.`mobilenumber` AS `cand_phone`,
    `d`.`rolename` AS `rolename`,
    `d`.`payrate` AS `payrate`,
    `e`.`city` AS `city`,
    `a`.`startdate` AS `interview_date`,
    `a`.`enddate` AS `interview_date_end`,
    `a`.`loaddate` AS `loaddate`,
    `a`.`ical` AS `ical`,
    `a`.`interviewid` AS `interviewid`,
    `a`.`candidateid` AS `candidateid`,
    `a`.`managerid` AS `managerid`
from `chatbot`.`demo_interview` `a` 
join `chatbot`.`demo_people` `b` on `b`.`personid` = `a`.`candidateid`
join `chatbot`.`demo_managers` `c` on `c`.`managerid` = `a`.`managerid`
join `chatbot`.`demo_roles` `d` on `d`.`roleid` = `a`.`roleid`
join `chatbot`.`demo_locations` `e` on `e`.`locationid` = `a`.`locationid`
join chatbot.v_max_interviewid f on f.interviewid = a.interviewid

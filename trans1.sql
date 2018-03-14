CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `chatbot`.`sp_demo_manager_hours`(in pmanagerid int, in pdate date, in intv_len int)
BEGIN
SELECT distinct a.start_time, a.end_time, a.end_time - interval intv_len minute as other_end_time
from demo_hours a
join demo_managers b on a.managerid = b.managerid
where b.managerid = pmanagerid and (date(a.start_time) = date(pdate) or pdate =0)
and a.start_time > now()
ORDER BY a.start_time
LIMIT 10;
END



truncate table demo_locations;
INSERT INTO demo_locations (gmt_offset, region, division, state, city, timezone, country, county, companyid)
	SELECT   DISTINCT  GMT_OFFSET, REGION, DIVISION, THESTATE, THECITY, TIMEZONE, COUNTRY, COUNTY, COMPANYID  FROM ( SELECT
	concat('',SUBSTRING_INDEX(SUBSTRING_INDEX(B.TIMEZONE, ' ', 1), '-',-1) * -1) AS GMT_OFFSET,
	REGION,
	DIVISION,
	CASE WHEN A.LOCATION NOT LIKE '%->%'  THEN RIGHT(A.LOCATION,2)  END AS THESTATE,
	CASE WHEN A.LOCATION NOT LIKE '%->%'  THEN LEFT(A.LOCATION,LENGTH(A.LOCATION) -3)  END AS THECITY,
	B.TIMEZONE,
    'USA' AS COUNTRY,
    A.LOCATION AS COUNTY,
    3 as companyid

FROM ADRITrugreen.T_USERS A
LEFT JOIN  TIMEZONES B ON A.LOCATION=B.LOCATION) D
WHERE THECITY IS NOT NULL;


SET SQL_SAFE_UPDATES = 0;
DELETE A
FROM demo_locations A
JOIN (SELECT * FROM (SELECT COUNTY,COUNT(*) NROWS FROM demo_locations GROUP BY 1) C WHERE NROWS >1) B ON A.COUNTY = B.COUNTY
;



TRUNCATE TABLE demo_managers;
INSERT INTO demo_managers (
	locationid,
	personcode,
	fullname,
	last_name,
    mobilenumber,
    emailaddress,
	default_interview_length,
	interview_rank,
	created_date,
	opt_out_email,
	opt_out_sms
)

SELECT
	B.locationid,
	USER_ID AS USER_CODE,
	USER_FNAME FULLNAME,
	USER_LNAME,
	USER_PHONE AS PHONE,
	USER_EMAIL AS EMAIL,
	DEFAULT_INTERVIEW_LENGTH,
	INTERVIEW_RANK,
	DATE_ADDED,
	OPT_OUT_EMAIL,
	OPT_OUT_SMS
FROM ADRITrugreen.T_USERS A
LEFT JOIN  demo_locations B ON B.COUNTY=A.LOCATION;


TRUNCATE TABLE demo_hours;
INSERT INTO demo_hours (
managerid,
start_time,
end_time
)
SELECT
	B.managerid,
	TIMESTAMP(C.THE_DATE, A.AVAILABLE_START) AS start_time,
	TIMESTAMP(C.THE_DATE, A.AVAILABLE_END) AS start_time

FROM  ADRITrugreen.T_PERSISTENT_AVAILABILITY A
JOIN demo_managers B ON B.personcode = A.USER_ID
JOIN V_DAYOFMONTH C ON C.WEEK_DAY_ID = A.AVAILABLE_DAY_ID;


TRUNCATE TABLE demo_roles;
INSERT INTO demo_roles (
	role_code,
    rolename,
    role_type,
    role_status,
    job_title,
    job_family
)
SELECT
	A.POSITION_ID,
    A.POSITION_NAME AS ROLE_NAME,
    A.POSITION_TYPE AS ROLE_TYPE,
    A.POSITION_STATUS AS ROLE_STATUS,
	A.JOB_TITLE,
    A.JOB_FAMILY

FROM ADRITrugreen.T_POSITIONS A
WHERE A.POSITION_NAME is NOT NULL
GROUP BY 1,2,3,4,5,6;


/*BEGIN DEMO_INTERVIEW HERE*/

TRUNCATE TABLE TEMP43A;
INSERT INTO TEMP43A
SELECT
    A.USER_ID,
    A.CLIENT_USER_ID,
	A.INTERVIEW_REFERENCE_ID,
	A.UNIXTIME_ID,
	A.TIMEMAP_ID

FROM  ADRITrugreen.T_TIME_USERS  A
WHERE A.USER_ID <> A.CLIENT_USER_ID;

TRUNCATE TABLE TEMP43;
INSERT INTO TEMP43
SELECT
    A.USER_ID,
    A.CLIENT_USER_ID,
	B.THEDATE,
	C.TIME_INSTANCE,
	A.INTERVIEW_REFERENCE_ID


FROM  TEMP43A  A
LEFT JOIN V_DYNAMIC_DAYSV2 B ON B.UNIXTIME_ID = A.UNIXTIME_ID
LEFT JOIN ADRITrugreen.T_TIME_MAP C ON C.ROW_ID=A.TIMEMAP_ID;


TRUNCATE TABLE TEMP44;
INSERT INTO TEMP44
SELECT

    F.POSITION_ID,
    A.USER_ID,
    A.CLIENT_USER_ID,
    F.LOCATION,
	TIMESTAMP(A.THEDATE, A.TIME_INSTANCE) AS START_DATE,
    (TIMESTAMP(A.THEDATE, A.TIME_INSTANCE) + INTERVAL (CASE WHEN L.INTERVIEW_LENGTH IS NULL THEN 20 ELSE L.INTERVIEW_LENGTH END) MINUTE) AS END_DATE,
    A.INTERVIEW_REFERENCE_ID

FROM  TEMP43  A
LEFT JOIN ADRITrugreen.T_INTERVIEW_POSITIONS E ON A.INTERVIEW_REFERENCE_ID=E.INTERVIEW_REFERENCE_ID
LEFT JOIN ADRITrugreen.T_POSITIONS F ON F.POSITION_ID = E.POSITION_ID
LEFT JOIN ADRITrugreen.V_INTERVIEW_LENGTH L ON L.USER_ID = A.CLIENT_USER_ID;


#create index idx_refid on refid (ref_code)
SET SQL_SAFE_UPDATES = 0;
TRUNCATE TABLE demo_interview;
INSERT INTO demo_interview (roleid, locationid, candidateid, managerid, startdate, enddate, INTERVIEW_REFERENCE_ID)
SELECT
	H.roleid,
    K.locationid,
    I.managerid AS CANDIDATE_ID,
    J.managerid AS MANAGER_ID,
	A.START_DATE,
    A.END_DATE,
    A.INTERVIEW_REFERENCE_ID

FROM TEMP44 A
left JOIN demo_roles H ON H.ROLE_CODE = A.POSITION_ID
left JOIN demo_managers I ON I.personcode = A.USER_ID
left JOIN demo_managers J ON J.personcode = A.CLIENT_USER_ID
left JOIN demo_locations K ON K.COUNTY= A.LOCATION;

truncate table refid;
insert into refid (rowid, ref_code, numrows) select ROW_ID, INTERVIEW_REFERENCE_ID, NROWS from chatbot.v_ref_id

update demo_interview a
join refid b on b.ref_code = a.INTERVIEW_REFERENCE_ID
set a.ref_id = b.rowid
where a.interviewid between 0 and 10000;

update demo_interview a
join refid b on b.ref_code = a.INTERVIEW_REFERENCE_ID
set a.ref_id = b.rowid
where a.interviewid between 10000 and 20000;

update demo_interview a
join refid b on b.ref_code = a.INTERVIEW_REFERENCE_ID
set a.ref_id = b.rowid
where a.interviewid between 20000 and 30000;

update demo_interview a
join refid b on b.ref_code = a.INTERVIEW_REFERENCE_ID
set a.ref_id = b.rowid
where a.interviewid between 30000 and 40000;

update demo_interview a
join refid b on b.ref_code = a.INTERVIEW_REFERENCE_ID
set a.ref_id = b.rowid
where a.interviewid between 40000 and 60000;


TRUNCATE TABLE TIME_MAP;
INSERT INTO TIME_MAP (TIME_MAP_ID, TIME_INSTANCE)
SELECT ROW_ID, TIME_INSTANCE FROM ADRITrugreen.T_TIME_MAP;


TRUNCATE TABLE TIMEZONE;
INSERT INTO TIMEZONE (GMT_OFFSET, SHORTNAME, LONGNAME )
SELECT UTC_OFFSET, TZ_SHORTNAME, TZ_LONGNAME FROM T_TIMEZONE_OFFSETS;



TRUNCATE table demo_interview_sub;
insert into demo_interview_sub (user_code, candidate, ref_id)
select
	a.USER_ID,
	case when a.USER_ROLE = 'Interviewer' then 0 else 1 end as candidate,
	b.rowid
from ADRITrugreen.T_INTERVIEW_USERS a
join refid b on a.INTERVIEW_REFERENCE_ID = b.ref_code
where b.id BETWEEN 0 and 50000;

insert into demo_interview_sub (user_code, candidate, ref_id)
select
	a.USER_ID,
	case when a.USER_ROLE = 'Interviewer' then 0 else 1 end as candidate,
	b.rowid
from ADRITrugreen.T_INTERVIEW_USERS a
join refid b on a.INTERVIEW_REFERENCE_ID = b.ref_code
where b.id BETWEEN 50001 and 100000;

insert into demo_interview_sub (user_code, candidate, ref_id)
select
	a.USER_ID,
	case when a.USER_ROLE = 'Interviewer' then 0 else 1 end as candidate,
	b.rowid
from ADRITrugreen.T_INTERVIEW_USERS a
join refid b on a.INTERVIEW_REFERENCE_ID = b.ref_code
where b.id BETWEEN 100001 and 150000;

insert into demo_interview_sub (user_code, candidate, ref_id)
select
	a.USER_ID,
	case when a.USER_ROLE = 'Interviewer' then 0 else 1 end as candidate,
	b.rowid
from ADRITrugreen.T_INTERVIEW_USERS a
join refid b on a.INTERVIEW_REFERENCE_ID = b.ref_code
where b.id BETWEEN 150001 and 200000;



truncate table TMP1;
insert into TMP1 (role_code, roleid)
SELECT B.POSITION_ID AS role_code, A.roleid
FROM demo_roles A
 JOIN   ADRITrugreen.T_POSITIONS  B
	ON B.POSITION_NAME = A.rolename
	AND B.POSITION_TYPE = A.role_type
    AND B.POSITION_STATUS = A.role_status
    AND B.JOB_TITLE = A.job_title;


TRUNCATE TABLE QUEUE;
 INSERT INTO QUEUE (MANAGER_ID, CANDIDATE_ID, ROLE_ID, LOCATION_ID)
 SELECT C.managerid AS MANAGER_ID, D.managerid AS CANDIDATE_ID, R.roleid, C.locationid

 FROM


 (SELECT USER_ID, INTERVIEW_REFERENCE_ID FROM ADRITrugreen.T_INTERVIEW_USERS A
 WHERE USER_ROLE = 'Interviewer') A
 JOIN demo_managers C ON C.personcode = A.USER_ID

 JOIN (SELECT USER_ID, INTERVIEW_REFERENCE_ID, SUBSTRING_INDEX(INTERVIEW_REFERENCE_ID,'-',-1) ROLE_CODE
 FROM ADRITrugreen.T_INTERVIEW_USERS A
 WHERE USER_ROLE = 'Candidate') B ON A.INTERVIEW_REFERENCE_ID = B.INTERVIEW_REFERENCE_ID
 JOIN demo_managers D ON D.personcode = B.USER_ID
   JOIN TMP1 R ON R.role_code = B.ROLE_CODE
GROUP BY 1,2,3,4;



TRUNCATE TABLE MESSAGE_TEMPLATE;
INSERT INTO MESSAGE_TEMPLATE (MESSAGE_STAGE,RECIPIENT_TYPE,MESSAGE_TYPE,MESSAGE_CONTENTS,MESSAGE_SUBJECT,
MESSAGE_FROM,MESSAGE_STATE)

SELECT
    `T_MESSAGE_TEMPLATES`.`MESSAGE_STAGE`,
    `T_MESSAGE_TEMPLATES`.`RECIPIENT_TYPE`,
    `T_MESSAGE_TEMPLATES`.`MESSAGE_TYPE`,
    `T_MESSAGE_TEMPLATES`.`MESSAGE_CONTENTS`,
    `T_MESSAGE_TEMPLATES`.`MESSAGE_SUBJECT`,
    `T_MESSAGE_TEMPLATES`.`MESSAGE_FROM`,
    `T_MESSAGE_TEMPLATES`.`MESSAGE_STATE`
FROM `ADRITrugreen`.`T_MESSAGE_TEMPLATES`;


TRUNCATE TABLE demo_logging;
INSERT INTO demo_logging (message_type_id,personid,created_date,interviewid)
 SELECT
    D.message_type_id,
    B.managerid,
    A.SEND_DATE_TIME,
    i.interviewid


FROM `ADRITrugreen`.`T_MESSAGING_LOG` A
JOIN demo_managers B ON B.personcode = A.MESSAGE_RECIPIENT_ID
join demo_message_type D on D.type_code = A.MESSAGE_TYPE
join demo_interview i on i.INTERVIEW_REFERENCE_ID = A.INTERVIEW_REFERENCE_ID;


TRUNCATE TABLE RPT_QUEUE;
INSERT INTO RPT_QUEUE (MANAGER_ID, CANDIDATE_ID,LOCATION_ID,DIVISION, REGION, COUNTY, CAND_FIRST_NAME, CAND_LAST_NAME, CAND_EMAIL, MGR_FIRST_NAME,
MGR_LAST_NAME, MGR_EMAIL, RECIEVE_MESSAGE, NUM_MESSAGES, INTERVIEW_SCHEDULED)
SELECT

	A.MANAGER_ID,
	A.CANDIDATE_ID,
	C.locationid,
	C.division,
	C.region,
	C.county,

	D.fullname AS CANDIDATE_FNAME,
	D.last_name AS CANDIDATE_LNAME,
	D.emailaddress AS CANDIDATE_EMAIL,

	B.fullname AS MANAGER_FNAME,
	B.last_name AS MANAGER_LNAMEL,
	B.emailaddress AS MANAGER_EMAIL,

    CASE WHEN L.personid IS NOT NULL THEN 'Y' ELSE 'N' END AS RECEIVED_MESSAGE,
	L.NROWS AS NUM_MESSAGES,
    CASE WHEN I.candidateid IS NOT NULL THEN 'Y' ELSE 'N' END AS INTERVIEW_SCHEDULED

FROM
(SELECT CANDIDATE_ID, MAX(MANAGER_ID) AS MANAGER_ID FROM QUEUE GROUP BY 1) A
 JOIN demo_managers B ON B.managerid = A.MANAGER_ID
 JOIN demo_managers D ON D.managerid = A.CANDIDATE_ID
 JOIN demo_locations C ON C.locationid = B.locationid
LEFT JOIN (SELECT personid, COUNT(*) NROWS FROM demo_logging GROUP BY 1) L ON L.personid = A.CANDIDATE_ID
LEFT JOIN (SELECT candidateid, COUNT(*) NROWS FROM demo_interview GROUP BY 1) I ON I.candidateid = A.CANDIDATE_ID;


TRUNCATE TABLE RPT_MESSAGE;
INSERT INTO RPT_MESSAGE (RECIPIENT_ID,LOCATION_ID, MESSAGE_TYPE, SEND_DATE,
RECIP_FIRST_NAME, RECIP_LAST_NAME, RECIP_EMAIL, DIVISION, REGION, COUNTY)
SELECT

	A.personid,
	i.locationid,
	m.type_code,
	A.created_date,


	B.fullname AS RECIPIENT_FNAME,
	B.last_name AS RECIPIENT_LNAME,
	B.emailaddress AS RECIPIENT_EMAIL,

	C.division,
	C.region,
	C.county

FROM demo_logging A
left join demo_interview i on i.interviewid = A.interviewid
LEFT JOIN demo_managers B ON B.managerid = A.personid
LEFT JOIN demo_locations C ON C.locationid = i.locationid
left join demo_message_type m on m.message_type_id = A.message_type_id;

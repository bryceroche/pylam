CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `SP_TRANS1`()
BEGIN


TRUNCATE TABLE LOCATION;
INSERT INTO LOCATION (GMT_OFFSET, REGION, DIVISION, STATE, CITY, TIME_ZONE, COUNTRY, COUNTY)
	SELECT   DISTINCT 
	concat('',SUBSTRING_INDEX(SUBSTRING_INDEX(B.TIMEZONE, ' ', 1), '-',-1) * -1) AS GMT_OFFSET,
	REGION,
	DIVISION, 
	CASE WHEN A.LOCATION NOT LIKE '%->%'  AND concat('',A.LOCATION * 1) <> A.LOCATION THEN RIGHT(A.LOCATION,2)  END AS THESTATE,
	CASE WHEN A.LOCATION NOT LIKE '%->%'  AND concat('',A.LOCATION * 1) <> A.LOCATION THEN LEFT(A.LOCATION,LENGTH(A.LOCATION) -3)  END AS THECITY,
	B.TIMEZONE,
    'USA' AS COUNTRY,
    A.LOCATION AS COUNTY

FROM ADRITrugreen.T_USERS A
LEFT JOIN  TIMEZONES B ON A.LOCATION=B.LOCATION;


SET SQL_SAFE_UPDATES = 0;
DELETE A
FROM LOCATION A
JOIN (SELECT * FROM (SELECT COUNTY,COUNT(*) NROWS FROM LOCATION GROUP BY 1) C WHERE NROWS >1) B ON A.COUNTY = B.COUNTY;


TRUNCATE TABLE USERS;
INSERT INTO USERS (
	LOCATION_ID,
	USER_CODE,
	FIRST_NAME, 
	LAST_NAME, 
	PHONE, 
    EMAIL, 
	DEFAULT_INTERVIEW_LENGTH,
	 INTERVIEW_RANK, 
	USER_SOURCE,
	DATE_ADDED, 
	OPT_OUT_EMAIL,
	OPT_OUT_SMS
)

SELECT 
	B.LOCATION_ID,
	USER_ID AS USER_CODE,
	USER_FNAME AS FIRST_NAME,
	USER_LNAME AS LAST_NAME,
	USER_PHONE AS PHONE, 
	USER_EMAIL AS EMAIL,
	DEFAULT_INTERVIEW_LENGTH,
	INTERVIEW_RANK,
	USER_SOURCE,
	DATE_ADDED,
	OPT_OUT_EMAIL,
	OPT_OUT_SMS
FROM ADRITrugreen.T_USERS A
LEFT JOIN  LOCATION B ON B.COUNTY=A.LOCATION;



TRUNCATE TABLE HOURS;
INSERT INTO HOURS (
USER_ID,
LOCATION_ID,
WEEKDAY_ID,
WEEKDAY,
START_TIME,
END_TIME,
INTERVIEWER_RANK,
INTERVIEW_LENGTH_MINUTES,
LUNCH_START,
LUNCH_END
)
SELECT  
	B.USER_ID, 
	B.LOCATION_ID,
	A.AVAILABLE_DAY_ID,
    A.AVAILABLE_DAY,
	A.AVAILABLE_START,
	A.AVAILABLE_END,
	A.INTERVIEWER_RANK,
	A.INTERVIEW_LENGTH_MINUTES,
	A.LUNCH_START,
	A.LUNCH_START + INTERVAL A.LUNCH_LENGTH_MINUTES MINUTE AS LUNCH_END
FROM  ADRITrugreen.T_PERSISTENT_AVAILABILITY A
JOIN USERS B ON B.USER_CODE = A.USER_ID;

END

CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `SP_TRANS2`()
BEGIN



TRUNCATE TABLE ROLES_TEMP;
INSERT INTO ROLES_TEMP (
	LOCATION_ID,
	ROLE_CODE,
	ROLE_NAME,
	ROLE_TYPE,
	ROLE_STATUS,
	JOB_CODE,
	JOB_TITLE,
	JOB_FAMILY
)
SELECT  
	B.LOCATION_ID,
	A.POSITION_ID AS ROLE_CODE,
	A.POSITION_NAME AS ROLE_NAME,
	A.POSITION_TYPE AS ROLE_TYPE,
	A.POSITION_STATUS AS ROLE_STATUS,
	A.JOB_CODE,
	A.JOB_TITLE,
	A.JOB_FAMILY

FROM ADRITrugreen.T_POSITIONS A
LEFT JOIN LOCATION B ON B.COUNTY=A.LOCATION
GROUP BY 1,2,3,4,5,6,7,8;


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

DROP TABLE IF EXISTS TEMP43;
CREATE TABLE TEMP43 AS
SELECT 
    A.USER_ID,
    A.CLIENT_USER_ID,
	B.THEDATE, 
	C.TIME_INSTANCE,
	A.INTERVIEW_REFERENCE_ID
  

FROM  TEMP43A  A
JOIN V_DYNAMIC_DAYSV2 B ON B.UNIXTIME_ID = A.UNIXTIME_ID
JOIN ADRITrugreen.T_TIME_MAP C ON C.ROW_ID=A.TIMEMAP_ID;

ALTER TABLE TEMP43 ADD INDEX `COUNTY` (`INTERVIEW_REFERENCE_ID`,`CLIENT_USER_ID`);



DROP TABLE IF EXISTS TEMP44;
CREATE TABLE TEMP44 AS
SELECT 
	
    F.POSITION_ID,
    A.USER_ID,
    A.CLIENT_USER_ID,
    F.LOCATION,
	TIMESTAMP(A.THEDATE, A.TIME_INSTANCE) AS START_DATE,
    (TIMESTAMP(A.THEDATE, A.TIME_INSTANCE) + INTERVAL (CASE WHEN L.INTERVIEW_LENGTH IS NULL THEN 20 ELSE L.INTERVIEW_LENGTH END) MINUTE) AS END_DATE

FROM  TEMP43  A
LEFT JOIN ADRITrugreen.T_INTERVIEW_POSITIONS E ON A.INTERVIEW_REFERENCE_ID=E.INTERVIEW_REFERENCE_ID
LEFT JOIN ADRITrugreen.T_POSITIONS F ON F.POSITION_ID = E.POSITION_ID
LEFT JOIN ADRITrugreen.V_INTERVIEW_LENGTH L ON L.USER_ID = A.CLIENT_USER_ID;

ALTER TABLE TEMP44 ADD INDEX `COUNTY` (`USER_ID`,`CLIENT_USER_ID`,`POSITION_ID`,`LOCATION`);




END

CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `SP_TRANS3`()
BEGIN
SET SQL_SAFE_UPDATES = 0;
TRUNCATE TABLE INTERVIEW;
INSERT INTO INTERVIEW (ROLE_ID, LOCATION_ID, CANDIDATE_ID, MANAGER_ID, START_DATE, END_DATE)
SELECT 
	H.ROLE_ID,
    K.LOCATION_ID,
    I.USER_ID AS CANDIDATE_ID,
    J.USER_ID AS MANAGER_ID,
	A.START_DATE,
    A.END_DATE


FROM TEMP44 A 
JOIN ROLES_TEMP H ON H.ROLE_CODE = A.POSITION_ID
JOIN USERS I ON I.USER_CODE = A.USER_ID
JOIN USERS J ON J.USER_CODE = A.CLIENT_USER_ID
JOIN LOCATION K ON K.COUNTY= A.LOCATION;

DROP TABLE IF EXISTS TEMP44;

TRUNCATE TABLE TIME_MAP;
INSERT INTO TIME_MAP (TIME_MAP_ID, TIME_INSTANCE)
SELECT ROW_ID, TIME_INSTANCE FROM ADRITrugreen.T_TIME_MAP;


TRUNCATE TABLE TIMEZONE;
INSERT INTO TIMEZONE (GMT_OFFSET, SHORTNAME, LONGNAME )
SELECT UTC_OFFSET, TZ_SHORTNAME, TZ_LONGNAME FROM T_TIMEZONE_OFFSETS;


TRUNCATE TABLE ROLES;
INSERT INTO ROLES (
    ROLE_NAME,
    ROLE_TYPE,
    ROLE_STATUS,
    JOB_TITLE,
    JOB_FAMILY
)
SELECT  
    A.POSITION_NAME AS ROLE_NAME,
    A.POSITION_TYPE AS ROLE_TYPE,
    A.POSITION_STATUS AS ROLE_STATUS,
	A.JOB_TITLE,
    A.JOB_FAMILY

FROM ADRITrugreen.T_POSITIONS A
GROUP BY 1,2,3,4,5;



CREATE TABLE TMP1 AS
SELECT B.POSITION_ID AS ROLE_CODE, A.ROLE_ID
FROM ROLES A
 JOIN   ADRITrugreen.T_POSITIONS  B
	ON B.POSITION_NAME = A.ROLE_NAME
	AND B.POSITION_TYPE = A.ROLE_TYPE
    AND B.POSITION_STATUS = A.ROLE_STATUS
    AND B.JOB_TITLE = A.JOB_TITLE;

CREATE INDEX IX_TMP1 ON TMP1(ROLE_CODE, ROLE_ID);


TRUNCATE TABLE QUEUE;
 INSERT INTO QUEUE (MANAGER_ID, CANDIDATE_ID, ROLE_ID, LOCATION_ID) 
 SELECT C.USER_ID AS MANAGER_ID, D.USER_ID AS CANDIDATE_ID, R.ROLE_ID, C.LOCATION_ID
 
 FROM 
 
 
 (SELECT USER_ID, INTERVIEW_REFERENCE_ID FROM ADRITrugreen.T_INTERVIEW_USERS A
 WHERE USER_ROLE = 'Interviewer') A
 JOIN USERS C ON C.USER_CODE = A.USER_ID
 
 JOIN (SELECT USER_ID, INTERVIEW_REFERENCE_ID, SUBSTRING_INDEX(INTERVIEW_REFERENCE_ID,'-',-1) ROLE_CODE 
 FROM ADRITrugreen.T_INTERVIEW_USERS A
 WHERE USER_ROLE = 'Candidate') B ON A.INTERVIEW_REFERENCE_ID = B.INTERVIEW_REFERENCE_ID
 JOIN USERS D ON D.USER_CODE = B.USER_ID
   JOIN TMP1 R ON R.ROLE_CODE = B.ROLE_CODE
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



TRUNCATE TABLE MESSAGE_LOG;
INSERT INTO MESSAGE_LOG (MESSAGE_TYPE,RECIPIENT_ID, SEND_DATE,LOCATION_ID, ROLE_ID)
 SELECT 
    A.MESSAGE_TYPE,
    B.USER_ID,
    A.SEND_DATE_TIME,
    B.LOCATION_ID, 
    R.ROLE_ID

FROM `ADRITrugreen`.`T_MESSAGING_LOG` A
JOIN USERS B ON B.USER_CODE = A.MESSAGE_RECIPIENT_ID
LEFT JOIN  ADRITrugreen.T_INTERVIEW_POSITIONS C ON C.INTERVIEW_REFERENCE_ID = A.INTERVIEW_REFERENCE_ID
LEFT JOIN TMP1 R ON R.ROLE_CODE = C.POSITION_ID;



UPDATE  MESSAGE_LOG A
JOIN (SELECT CANDIDATE_ID, MAX(MANAGER_ID) AS MANAGER_ID FROM QUEUE GROUP BY 1) B ON B.CANDIDATE_ID = A.RECIPIENT_ID
JOIN USERS U ON U.USER_ID = B.MANAGER_ID
SET A.LOCATION_ID = U.LOCATION_ID;


TRUNCATE TABLE RPT_QUEUE;
INSERT INTO RPT_QUEUE (MANAGER_ID, CANDIDATE_ID,LOCATION_ID,DIVISION, REGION, COUNTY, CAND_FIRST_NAME, CAND_LAST_NAME, CAND_EMAIL, MGR_FIRST_NAME, 
MGR_LAST_NAME, MGR_EMAIL, RECIEVE_MESSAGE, NUM_MESSAGES, INTERVIEW_SCHEDULED)
SELECT 
	
	A.MANAGER_ID, 
	A.CANDIDATE_ID,
	C.LOCATION_ID,
	C.DIVISION, 
	C.REGION, 
	C.COUNTY, 
    
	D.FIRST_NAME AS CANDIDATE_FNAME, 
	D.LAST_NAME AS CANDIDATE_LNAME, 
	D.EMAIL AS CANDIDATE_EMAIL,
    
	B.FIRST_NAME AS MANAGER_FNAME, 
	B.LAST_NAME AS MANAGER_LNAMEL, 
	B.EMAIL AS MANAGER_EMAIL,
    
    CASE WHEN L.RECIPIENT_ID IS NOT NULL THEN 'Y' ELSE 'N' END AS RECEIVED_MESSAGE,
	L.NROWS AS NUM_MESSAGES,
    CASE WHEN I.CANDIDATE_ID IS NOT NULL THEN 'Y' ELSE 'N' END AS INTERVIEW_SCHEDULED

FROM 
(SELECT CANDIDATE_ID, MAX(MANAGER_ID) AS MANAGER_ID FROM QUEUE GROUP BY 1) A
 JOIN USERS B ON B.USER_ID = A.MANAGER_ID
 JOIN USERS D ON D.USER_ID = A.CANDIDATE_ID
 JOIN LOCATION C ON C.LOCATION_ID = B.LOCATION_ID
LEFT JOIN (SELECT RECIPIENT_ID, COUNT(*) NROWS FROM MESSAGE_LOG GROUP BY 1) L ON L.RECIPIENT_ID = A.CANDIDATE_ID
LEFT JOIN (SELECT CANDIDATE_ID, COUNT(*) NROWS FROM INTERVIEW GROUP BY 1) I ON I.CANDIDATE_ID = A.CANDIDATE_ID;


TRUNCATE TABLE RPT_MESSAGE;
INSERT INTO RPT_MESSAGE (RECIPIENT_ID,LOCATION_ID, MESSAGE_TYPE, SEND_DATE, 
RECIP_FIRST_NAME, RECIP_LAST_NAME, RECIP_EMAIL, DIVISION, REGION, COUNTY)
SELECT  

	A.RECIPIENT_ID,
	A.LOCATION_ID,
	A.MESSAGE_TYPE,
	A.SEND_DATE,
    

	B.FIRST_NAME AS RECIPIENT_FNAME,
	B.LAST_NAME AS RECIPIENT_LNAME,
	B.EMAIL AS RECIPIENT_EMAIL,

	C.DIVISION, 
	C.REGION, 
	C.COUNTY 

FROM MESSAGE_LOG A
LEFT JOIN USERS B ON B.USER_ID = A.RECIPIENT_ID
LEFT JOIN LOCATION C ON C.LOCATION_ID = A.LOCATION_ID;

DROP TABLE IF EXISTS TMP1;
END
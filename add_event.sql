CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `chatbot`.`api_add_event`(   
    P_ID VARCHAR(255),
    P_TITLE VARCHAR(255),
    OUT O_ID VARCHAR(255)
)
BEGIN
	INSERT INTO chatbot.demo_interview(interviewid,interview_title)
    VALUES (P_ID,P_TITLE)
    ON duplicate key update
    interview_title = P_TITLE;

    SET O_ID = P_ID;
    SELECT O_ID;
END

------------------

locationid contains all the location related data (city, state, zip, country, gmt_offset etc. etc.)



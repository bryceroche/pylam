CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `sp_set_person1`(IN pusercode varchar(100), IN pcity varchar(100), prole varchar(100))
BEGIN

DECLARE locid INT;
DECLARE theroleid INT;
declare personid int;
    
set theroleid = (select roleid from demo_roles where lower(rolename) = (prole));
set locid = (select locationid from demo_locations where lower(city) = (pcity));

START TRANSACTION;
insert into demo_people ( personcode) values(pusercode );
commit;

set personid = (select max(personid) from demo_people where personcode = pusercode );

insert into demo_interview ( roleid, locationid, candidateid  ) values(theroleid, locid, personid );
  
select personid;
select locid;
select theroleid;

END
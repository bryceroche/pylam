CREATE DEFINER=`adridba`@`%` PROCEDURE `RBSDEMO`.`sp_set_person1`(IN pusercode varchar(100), IN pcity varchar(100), prole varchar(100))
BEGIN

DECLARE locid INT;
DECLARE theroleid INT;
declare thepersonid int;
    
set theroleid = (select roleid from demo_roles where lower(rolename) = lower(prole));
set locid = (select locationid from demo_locations where lower(city) = lower(pcity));

insert into demo_people ( personcode) values(pusercode );

set thepersonid = (select max(personid) from demo_people where personcode = pusercode );

select theroleid;
select locid;
select thepersonid;

insert into demo_interview ( roleid, locationid, candidateid  ) values(theroleid, locid, thepersonid );

END
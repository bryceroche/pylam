CREATE DEFINER=`adritrugreendba`@`%` PROCEDURE `sp_set_person1`(IN pusercode varchar(100), IN pcity varchar(100), prole varchar(100))
BEGIN

DECLARE locid INT;
DECLARE theroleid INT;
declare thepersonid int;
    
set theroleid = (select roleid from demo_roles where lower(rolename) = (prole));
set locid = (select locationid from demo_locations where lower(city) = (pcity));

insert into demo_people ( personcode) values(pusercode );

set thepersonid = (select max(personid) from demo_people where personcode = pusercode );

insert into demo_interview ( roleid, locationid, candidateid  ) values(theroleid, locid, thepersonid );

END

SET SQL_SAFE_UPDATES = 0;
update demo_job_openings
set managerid = FLOOR( 1 + RAND( ) *3 )

SET SQL_SAFE_UPDATES = 0;
update demo_job_openings
set startdate = startdate + interval 10 day

SET SQL_SAFE_UPDATES = 0;
update demo_hours set managerid = 1 where managerid = 11122233;
update demo_hours set managerid = 2 where managerid = 522765;
update demo_hours set managerid = 3 where managerid = 10020802;

	case managerid
	when '11122233' then 1
    when '522765' then 2
    when '10020802' then 3 
    end as asdlkd
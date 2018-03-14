select b.*
from demo_job_openings k 
join demo_roles b on k.roleid=b.roleid
join 
 (
  select  a.roleid, min(openid) as openid
  from demo_job_openings a
  join demo_locations c on c.locationid=a.locationid
  where lower(c.city) = lower('houston') 
	and a.companyid = 2
	group by a.roleid) j on j.openid = k.openid




   select b.*
  from demo_job_openings a
  join demo_roles b on a.roleid=b.roleid
  join demo_locations c on c.locationid=a.locationid
  where lower(c.city) = lower(pstr1) 
	and a.companyid = pcompanyid;
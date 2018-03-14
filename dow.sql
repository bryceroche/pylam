select
    `C`.`THE_DATE` AS `THE_DATE`,
    demo_hours.`USER_ID` AS `USER_ID`,
    demo_hours.`WEEKDAY` AS `WEEKDAY`,
    demo_hours.`WEEKDAY_ID` AS `WEEKDAY_ID`,
    concat( `C`.`THE_DATE`, ' ', demo_hours.`START_TIME` ) AS `AVAILABLE_START`,
    concat( `C`.`THE_DATE`, ' ', demo_hours.`END_TIME` ) AS `AVAILABLE_END`,
    concat( `C`.`THE_DATE`, ' ', demo_hours.`LUNCH_START` ) AS `LUNCH_START`,
    concat( `C`.`THE_DATE`, ' ', demo_hours.`LUNCH_END` ) AS `LUNCH_END`
from
    (
        `demo_hours` join `vdayofmonth` `C` on
        (
            (
                `C`.`WEEK_DAY_ID` = demo_hours.`WEEKDAY_ID`
            )
        )
    )

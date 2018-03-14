import sys
import logging
import rds_configv2 as rds_config
import pymysql
#rds settings
rds_host  = "trugreen.crk1o9ha4m4n.us-west-2.rds.amazonaws.com"
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except:
    logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
    sys.exit()

logger.info("SUCCESS: Connection to RDS mysql instance succeeded")

def handle_stored_procecurev2(spname, data):
    logger.debug('in the handle_stored_procecure')
    logger.debug(data)

    cur = conn.cursor()
    cur.callproc(spname, data)
    conn.commit()
    cur.close()


def handle_stored_procecure_no_paramsv2(spname):
    logger.debug('in the handle_stored_procecure_no_params 6')
    theresult = []
    cur = conn.cursor()
    cur.callproc(spname)
    for row in cur:
            theresult.append(row[0])
    conn.commit()
    cur.close()
    return theresult


def handle_stored_procecure_return_datav2(spname, data):
    logger.debug('in the handle_stored_procecure_return_data')
    logger.debug(data)

    theresult =[]
    cur = conn.cursor()
    cur.callproc(spname, data)
    for row in cur:
        theresult.append(row)

    conn.commit()
    cur.close()
    return theresult


















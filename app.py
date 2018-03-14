import sys
import logging
import rds_configv2 as rds_config
import pymysql
#rds settings
rds_host  = "trugreen.crk1o9ha4m4n.us-west-2.rds.amazonaws.com"

name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name


logging.basicConfig()
logger = logging.getLogger('logger')
logger.setLevel(logging.DEBUG)

try:
    conn = pymysql.connect(rds_host, user=name, passwd=password, db=db_name, connect_timeout=5)
except:
    logger.error("ERROR: Unexpected error: Could not connect to MySql instance.")
    sys.exit()

logger.info("SUCCESS: Connection to RDS mysql instance succeeded")


def handle_stored_procecure(spname, data):
    logger.debug('in the handle_stored_procecure')
    logger.debug(spname)
    logger.debug(data)

    cur = conn.cursor()
    cur.callproc(spname, data)
    conn.commit()
    cur.close()


def handle_stored_procecure_no_params(spname):
    logger.debug('in the handle_stored_procecure_no_params 6')
    logger.debug(spname)
    theresult = []
    cur = conn.cursor()
    cur.callproc(spname)
    for row in cur:
            theresult.append(row[0])
    conn.commit()
    cur.close()
    return theresult


def handle_stored_procecure_return_data(spname, data):
    logger.debug('in the handle_stored_procecure_return_data')
    logger.debug(data)
    logger.debug(spname)

    theresult =[]
    cur = conn.cursor()
    cur.callproc(spname, data)
    for row in cur:
        theresult.append(row)

    conn.commit()
    cur.close()
    return theresult

def get_data(spname, data):
    logger.debug('in the get_data')
    logger.debug(data)
    logger.debug(spname)
    cur = conn.cursor()
    cur.callproc(spname, data)
    result_set = cur.fetchall()
    conn.commit()
    cur.close()
    return result_set


def sp_return_data(spname, data):
    logger.debug('in the sp_return_data 3')
    logger.debug(data)
    logger.debug(spname)

    cur = conn.cursor()
    cur.callproc(spname, data)
    conn.commit()
    cur.close()
    return cur.fetchall()



def return_Data2(spname, data):
    logger.debug('in the handle_stored_procecure_return_data')
    logger.debug(data)
    logger.debug(spname)

    cur = conn.cursor()
    cur.callproc(spname, data)
    for row in cur:
        theresult = row[0]
        

    conn.commit()
    cur.close()
    return theresult


def insert_many_answer(data):
    cursor = conn.cursor()
    sql = "insert into demo_answer (nodeid, managerid, solutionid, startdate, enddate) values(%s, %s, %s, %s, %s)"
    number_of_rows = cursor.executemany(sql, data)
    conn.commit()
    conn.close()
    print number_of_rows










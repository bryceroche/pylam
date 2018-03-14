
import sys
import logging
import rds_configv2 as rds_config
import pymysql
#rds settings
rds_host  = "adriras.crk1o9ha4m4n.us-west-2.rds.amazonaws.com"

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


def printstuff(rang):
	for a in rang:
		print a  

def abc():
	cur = conn.cursor()
	arr = []
	arr2 = []
	#cur.execute("SHOW TABLES") 
	cur.execute("SHOW PROCEDURE STATUS where db = 'chatbot'") 
	for row in cur:
		arr.append(row[1])
	
	for a in arr:
		exect = "SHOW CREATE PROCEDURE " + a
		curr = conn.cursor()
		print exect
		curr.execute(exect)

		for b in curr:
			arr2.append([exect, b])



	return arr2


printstuff(abc())

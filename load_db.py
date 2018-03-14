import json
import datetime
import time
import os
import dateutil.parser
import logging
from app import handle_stored_procecure, handle_stored_procecure_no_params, handle_stored_procecure_return_data, get_data
import boto3
import re
import csv


#load local CSV file on my desktop to mysql db
def test1():

	with open('file88.csv', 'rb') as csvfile:
		thereader = csv.reader(csvfile, delimiter=',', quotechar="'")
		for row in thereader:
			#print(row[0] + ' ' + row[1] + ' ' + row[2])
			handle_stored_procecure('sp_load_db', [row[0], row[1], row[2], row[3]])

test1()

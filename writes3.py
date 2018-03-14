
import json
import datetime
import time
import os
import dateutil.parser
import logging
import boto3


#pointing RBSDEMO database now
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def writefile(filename):
	logger.debug('in the writefile')
	f= open(use_tmp(filename),"w+")
	for i in range(10):
		f.write("This is line %d\r\n" % (i+1))
	f.close() 
	return f

def list_buckets():
	logger.debug('in the list_buckets')
	s3 = boto3.resource('s3')
	for bucket in s3.buckets.all():
		logger.debug(bucket.name)


def upload_file(file):
	logger.debug(file)
	logger.debug('in the upload_file')
	with open(use_tmp(file)) as f: data = f.read()
	#data = open(file, 'rb')
	s3 = boto3.resource('s3')
	s3.Bucket('adritestbucket4').put_object(Key=file, Body=data)

def use_tmp(f):
	return '/tmp/' + f

def write_to_s3(data):


	filename = 'abc.txt'
	f = writefile(filename)
	upload_file(filename)
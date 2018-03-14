import json
import datetime
import time
import os
import dateutil.parser
import logging
from app import get_data
import boto3
import re
from send2 import clean_phone_no, send_one_email


def set1():
	client = boto3.client('sns')
	notifications = get_data('sp_notify', [])
	for a in notifications:
		comm =  a[11].lower()
		starttime = a[0].strftime('%I:%M %p')
		endtime = a[1].strftime('%I:%M %p')
		theday = a[0].strftime('%Y-%m-%d')
		cleanphone = clean_phone_no(a[9])
		emailadd = a[8]
		therole = a[12]
		thekey = a[13]
		interviewid = a[3]

		msg = 'Hi '+ a[10] +'!  Unfortunately we have to reschedule your interview that was scheduled for ' + theday + ' from ' + starttime + ' to ' + endtime + ' for the ' + therole +' role.  Please follow this link to reschedule.  Thank you! <a class="ulink" href="http://chat.adri-hr.com?id='+ thekey +' " target="_blank">Link to Audrey</a>'
		
		if (comm=='both' or comm=='sms'):
			client.publish(
				PhoneNumber= cleanphone,
				Message= msg
			)

		if (comm=='both' or comm=='email'):
			send_one_email(emailadd, msg, 'Interview Reschedule')
		

		b = get_data('sp_notified', [interviewid])
		
		print msg


set1()
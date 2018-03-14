
import json
import datetime
import time
import os
import dateutil.parser
import logging
#from twilio.rest import Client
import re
from app import get_data
import boto3


#pointing RBSDEMO database now
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def send1():
    prospects = get_data('sp_send_email', [])

    for a in prospects:
        themessage = 'Hi ' + a[2] + '!  Welcome to ADRI!  Please follow the link to the chatbot to begin your interview process. <a class="ulink" href="http://chat.adri-hr.com/" target="_blank">Link to Audrey</a>.'

        if(len(a[3])>9):
        	boto3_sms_aws(clean_phone_no(a[3]), themessage)
        	print themessage


def clean_phone_no(a):
    a = re.sub('[-()!@+#$]', '', a)
    a = a.replace(' ', '')

    if len(a) < 10:
        return 0

    if len(a) == 10:
        return '+1' + a

    if len(a) == 11:
        if a[:1] == '+':
            return '+1' + a[:10]

        else:
            return '+' + a[:11]

    return a


def send_sms_twilio(to_num, themessage):
	from_num = "+14422374210"
	account_sid = "AC2465c193b99bee044572bcc388da25c2"
	auth_token  = "8258fab68ffe234e5e344a5f7d340673"

	client = Client(account_sid, auth_token)

	message = client.messages.create(
	    to= clean_phone_no(to_num), 
	    from_= from_num,
	    body= themessage)

	print(message.sid)


#send1()
def boto3_sms_aws(phoneno, pmessage):
	client = boto3.client('sns')


	client.publish(
	    PhoneNumber= phoneno,
	    Message= pmessage
	)



send1()

















































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


def text_all_prospects():
    prospects = get_data('sp_send_email', [])

    for a in prospects:
        if (a[0]==6):
            themessage = 'Hi ' + a[2] + '!  Welcome to ADRI!  Please follow the link to the chatbot to begin your interview process. <a class="ulink" href="http://chat.adri-hr.com?id='+ a[5] +'" target="_blank">Link to Audrey</a>.'

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


def boto3_sms_aws(phoneno, pmessage):
	client = boto3.client('sns')


	client.publish(
	    PhoneNumber= phoneno,
	    Message= pmessage
	)



text_all_prospects()

















































import json
import datetime
import time
import os
import dateutil.parser
import logging
import re
from app import get_data
import boto3


#pointing chatbot database now
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

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
    
def setup(the_email):
    client = boto3.client('sns')

    data = get_data('sp_confirm', [the_email])
    logger.debug(data)

    if (data):
        a = data[0]

        starttime = a[4].strftime('%I:%M %p')
        endtime = a[5].strftime('%I:%M %p')
        theday = a[4].strftime('%Y-%m-%d')
        cleanphone = clean_phone_no(a[2])
        therole = a[9]

        msg = 'Hi '+ a[0] +'!  Thank you for scheduling your interview.  We have you booked on ' + theday + ' from ' + starttime + ' to ' + endtime + ' with ' + a[6] + ' in ' + a[7] + ' for the ' + therole +' role.  See you then!'


        if (a[3]=='both' or a[3]=='sms'):
            client.publish(
                PhoneNumber= cleanphone,
                Message= msg
            )

        if (a[3]=='both' or a[3]=='email'):
            send_one_email(a[1], msg, 'Interview Confirmation')
    else:
        logger.debug('nothing for this email ...' + str(the_email))


def send_one_email(theemail, msg, thetitle):
    client = boto3.client('ses')

    response = client.send_email(
        Destination={
            'BccAddresses': [
            ],
            'ToAddresses': [
                theemail,
            ],
        },
        Message={
            'Body': {
                'Html': {
                    'Charset': 'UTF-8',
                    'Data': msg,
                },
                'Text': {
                    'Charset': 'UTF-8',
                    'Data': msg,
                },
            },
            'Subject': {
                'Charset': 'UTF-8',
                'Data': thetitle,
            },
        },
        Source='info@adri-sys.com',
    )


def lambda_handler(event, context):


    logger.debug('this is the event')
    logger.debug(event)
    logger.debug('this is the context ...')
    logger.debug(context)


    the_email = event['emailaddress']


    setup(the_email)

    return event

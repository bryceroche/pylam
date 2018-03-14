import boto3
from app import get_data
import logging



logging.basicConfig()
logger = logging.getLogger('logger')
logger.setLevel(logging.DEBUG)

#fire off emails with link to audrey
"""
update demo_prospects a
join demo_people b on a.emailaddress = b.emailaddress 
set a.encrypt_key = b.encrypted

"""
def send1():
    prospects = get_data('sp_send_email', [])

    for a in prospects:
        send_emailv2(a[1], a[2], a[5])

def send_emailv2(theemail, thename, thekey):
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
                    'Data': 'Hi ' + thename + '!  Please follow the link to update us your current availability. We have exciting jobs all over the USA and these jobs are also updated constantly. Audrey our virtual assistant will help you update us, your availability, communication preferences and if you are not available, we can note down when to contact you later.  Thanks for your time.  <a class="ulink" href="http://chat.adri-hr.com?id='+ thekey +' " target="_blank">Link to Audrey</a>.',
                },
                'Text': {
                    'Charset': 'UTF-8',
                    'Data': 'This is the message body in text format.',
                },
            },
            'Subject': {
                'Charset': 'UTF-8',
                'Data': 'Welcome to Audrey',
            },
        },
        Source='support@adri-sys.com',
    )

    print(response)


def abc():

    client = boto3.client('ses', region_name='us-west-2')
    response = client.verify_email_identity(EmailAddress='support@addresses.com')
    print response

send1()

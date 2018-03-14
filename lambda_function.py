
import json
import datetime
import time
import os
import dateutil.parser
import logging
from app import handle_stored_procecure, handle_stored_procecure_no_params, handle_stored_procecure_return_data, get_data
import boto3
import re
from rng2 import availability
from panel import panel_meeting
from or_full_join import or_full_join_method
from send2 import send_sms_email, send_one_email

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def elicit_slot(session_attributes, intent_name, slots, slot_to_elicit, message):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': intent_name,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message
        }
    }


def elicit_slot_response_card(session_attributes, intent_name, slots, slot_to_elicit, message, responsecard):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': intent_name,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message, 
            'responseCard': responsecard
        }
    }

def confirm_intent(session_attributes, intent_name, slots, message):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'ConfirmIntent',
            'intentName': intent_name,
            'slots': slots,
            'message': message
        }
    }


def close(session_attributes, fulfillment_state, message):
    response = {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }

    return response


def delegate(session_attributes, slots):
    return {
        'sessionAttributes': session_attributes,
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        pass
 
    try:
        import unicodedata
        unicodedata.numeric(s)
        return True
    except (TypeError, ValueError):
        pass
 
    return False


def safe_int(n):
    if n is not None:
        return int(n)
    return n

def has_data(the_str, leng=0):
    if (not the_str):
        return False
    if (the_str):
        if len(the_str) >= leng:
            return True
        else:
            return False

def try_ex(func):
    try:
        return func()
    except KeyError:
        return None


def isvalid_city(city):
    valid_cities = ['new york', 'los angeles', 'chicago', 'houston', 'philadelphia', 'phoenix', 'san antonio',
                    'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'san francisco', 'indianapolis',
                    'columbus', 'fort worth', 'charlotte', 'detroit', 'el paso', 'seattle', 'denver', 'washington dc',
                    'memphis', 'boston', 'nashville', 'baltimore', 'portland']
    return city.lower() in valid_cities

def isvallid_time(time):
    timeformat = "%H:%M"
    try:
        validtime = datetime.datetime.strptime(time, timeformat)
        return True
    except ValueError:
        return False

def isvalid_room_type(room_type):
    room_types = ['queen', 'king', 'deluxe']
    return room_type.lower() in room_types


def isvalid_date(date):
    try:
        dateutil.parser.parse(date)
        return True
    except ValueError:
        return False

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

def get_day_difference(later_date, earlier_date):
    later_datetime = dateutil.parser.parse(later_date).date()
    earlier_datetime = dateutil.parser.parse(earlier_date).date()
    return abs(later_datetime - earlier_datetime).days


def add_days(date, number_of_days):
    new_date = dateutil.parser.parse(date).date()
    new_date += datetime.timedelta(days=number_of_days)
    return new_date.strftime('%Y-%m-%d')

def violated_slot(intent_request, validation_result):
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    slots[validation_result['violatedSlot']] = None
    return elicit_slot(
        session_attributes,
        intent_request['currentIntent']['name'],
        slots,
        validation_result['violatedSlot'],
        validation_result['message']
    )

def build_validation_result(isvalid, violated_slot, message_content):
    return {
        'isValid': isvalid,
        'violatedSlot': violated_slot,
        'message': {'contentType': 'PlainText', 'content': message_content}
    }

def pre_elicit_slot(intent_request, slotname, message):
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}

    return elicit_slot(
        session_attributes,
        intent_request['currentIntent']['name'],
        intent_request['currentIntent']['slots'],
        slotname,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )

def get_availability_details(intent_request):
    #collect user information we use role and location to determine the manager
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    interested_in_job = slots['interested']
    emailaddress = slots['emailaddress']
    emailexists = slots['emailexists']
    the_name = slots['name']
    slots['step'] = 0
    the_user = intent_request['userId']
    alertyn = slots['alertyn']

    if (emailaddress and not alertyn):
        title = 'new lead... ' + str(emailaddress)
        send_one_email('info@adri-sys.com', title, title)
        slots['alertyn'] = 'sent'


    if (not emailaddress):
        return pre_elicit_slot(intent_request, 'emailaddress', 'Please enter your email address.')

    if (emailaddress and not the_name):

        rtn_fullname = get_data('sp_demo_getemail_name', [emailaddress])
        if (rtn_fullname):
            handle_stored_procecure('sp_set_personcode', [emailaddress, the_user])
            the_name = str(rtn_fullname[0])[2:-3]
        elif (not rtn_fullname):
            slots['emailexists'] = 'no'
            return pre_elicit_slot(intent_request, 'name', 'What is your name?')

    if (emailaddress and the_name and emailexists=='no'):
        handle_stored_procecure('sp_add_person', [the_user, the_name, emailaddress])
        slots['emailexists'] = 'yes'

    if (not interested_in_job):
        return pre_elicit_slot(intent_request, 'interested', 'Hi ' + the_name + '!  Are you available immediately?')

    if (interested_in_job == 'no'):
        return follow_up_later(intent_request)

    elif (interested_in_job=='yes'):
        return intrested_in_job_fn(intent_request)
        raise Exception('Bombed out in the get_availability_details') 


def follow_up_later(intent_request, custommsg=''):
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    laterdate = slots['laterdate']
    laterdateyn = slots['laterdateyn']
    emailaddress = slots['emailaddress']
    the_mobile = slots['mobile']
    sms_email = slots['sms_email']
    the_user = intent_request['userId']
    slots['step'] = 1

    if (custommsg == ''):
        custommsg = 'May we follow up with you at a later date?'

    if (not laterdateyn):
        return pre_elicit_slot(intent_request, 'laterdateyn', custommsg)

    if (laterdateyn == 'no'):
        handle_stored_procecure('sp_demo_set_interest', [emailaddress, 'no'])
        return close(
            session_attributes,
            'Fulfilled',
            {
                'contentType': 'PlainText',
                'content': 'Thanks, we understand that you are not interested.  Good luck to you!'
                
            }
        )

    if (laterdateyn == 'yes' and not laterdate):
        return pre_elicit_slot(intent_request, 'laterdate', 'What date may we follow up?')


    if (laterdateyn == 'yes' and laterdate):

        data = get_data('sp_get_contact_info', [the_user])
        if (data):
            dbmobilie = data[0][2]
            dbsms_email = data[0][3]
            if(has_data(dbmobilie, 10)):
                the_mobile = dbmobilie
                slots['mobile'] = dbmobilie

            if(has_data(dbsms_email, 3)):
                sms_email = dbsms_email
                slots['sms_email'] = dbsms_email


        if (not sms_email):
            return pre_elicit_slot(intent_request, 'sms_email','Would you prefer we reach you via sms, email or both?  Please say either "sms", "email" or "both".')

        if(not the_mobile):
            if (sms_email == 'both' or sms_email == 'sms'):
                return pre_elicit_slot(intent_request, 'mobile','What is your cell phone number?')

        end_date = laterdate 
        slots['step'] = 2
        handle_stored_procecure('sp_demo_set_interest', [emailaddress, 'yes'])
        handle_stored_procecure('sp_demo_later_date', [emailaddress, end_date])
        return close(
            session_attributes,
            'Fulfilled',
            {
                'contentType': 'PlainText',
                'content': 'Thank you!  We will follow up with you on ' + end_date 
                
            }
        )

def intrested_in_job_fn(intent_request):
    logger.debug('intrested_in_job_fn')
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    the_city = slots['Location']
    the_position = slots['Position']
    the_mobile = slots['mobile']
    emailaddress = slots['emailaddress']
    the_user = intent_request['userId']
    slots['step'] = 2
    companyid = 2

    if (has_data(the_mobile)):
        logger.debug('skipping to get_contact_information')
        return get_contact_information(intent_request)
    else:
        if (not the_city):
            cities = get_data('sp_get_city', [companyid])
            sentence = ', '.join(city[0] for city in cities)
            return pre_elicit_slot(intent_request, 'Location', 'Here is a list of cities we have current openings in ' + sentence + '.  Or you can say "none".')

        if(the_city=='none'):
            return follow_up_later(intent_request)

        if (the_city and not the_position):
            theroles = get_data('sp_get_locationid', [the_city, companyid])

            if not theroles:
                kd = get_data('sp_missed_loc', [the_user, the_city])
                #send_sms_email(emailaddress)
                rtn_msg = 'We have recorded your city preference and will follow up with you when we have openings in '+ the_city +'.  Thank you!'
                return close(
                    session_attributes,
                    'Fulfilled',
                    {
                        'contentType': 'PlainText',
                        'content': rtn_msg
                    }
                )   
                

            sentence = ', '.join(word[3] for word in theroles)
            themessage = 'Which position are you interested in?  We have ' + sentence + ' roles available.  If none of these roles are of interest please say "none".'
            return pre_elicit_slot(intent_request, 'Position', themessage)

        if (the_position):
            if (the_position == 'none'):
                return follow_up_later(intent_request, 'We don\'t have any other job options for '+ the_city +' currently.  May we follow up with you at a later date?')

            theroles = get_data('sp_get_locationid', [the_city, companyid])
            if (the_position.lower() not in (row[3].lower() for row in theroles)):
                return pre_elicit_slot(intent_request, 'Position', 'Please enter a role listed above.')

            slots['stepa'] = 1
            handle_stored_procecure('sp_set_person1', [emailaddress, the_city, the_position, companyid])
            handle_stored_procecure('sp_demo_set_interest', [emailaddress, 'yes'])
            slots['step'] = 3
            return get_contact_information(intent_request)
            


def  get_contact_information(intent_request):
    logger.debug('get_contact_information')
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    the_name = slots['name'] 
    the_mobile = slots['mobile']
    emailaddress = slots['emailaddress']
    sms_email = slots['sms_email']
    the_position = slots['Position']
    the_user = intent_request['userId']
    slots['step'] = 3

    if (the_position == 'none'):
        return follow_up_later(intent_request) 
    
    data = get_data('sp_get_contact_info', [the_user])
    dbmobilie = data[0][2]
    dbsms_email = data[0][3]

    if (not the_mobile):
        if(has_data(dbmobilie, 10)):
            logger.debug('we already have phone number in database')
            the_mobile = dbmobilie
            slots['mobile'] = dbmobilie
        else:
            return pre_elicit_slot(intent_request, 'mobile','What is your cell phone number?')

    if (not sms_email):
        if(has_data(dbsms_email, 3)):
            sms_email = dbsms_email
            slots['sms_email'] = dbsms_email
        else:
            return pre_elicit_slot(intent_request, 'sms_email','Would you prefer we reach you via sms, email or both?  Please say either "sms", "email" or "both".')

    slots['step'] = 4
    handle_stored_procecure('sp_set_person', [the_user, the_mobile, sms_email])
    return manager_availability_routine(intent_request)
        
    raise Exception('Bombed out in the get_contact_information') 
   
def  manager_availability_routine(intent_request):
    logger.debug('inside the manager_availability_routine')
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    the_time = slots['timeslot']
    the_date = slots['dateslot']
    the_user = intent_request['userId']
    emailaddress = slots['emailaddress']
    intv_len = 20
    slots['step'] = 4

    the_manager = get_data('sp_get_managerid', [the_user])
    """
    this is where you would call the OR routine or_full_join.py file
    like this
    or_full_join_method([1,2,3], 20)
    
    implement this after you setup the table for "N" managers per job opening


    """
    if (any(row[0] == -1  for row in the_manager)):
        themessage = 'We could not find the role and location you requested.'
        return pre_elicit_slot(intent_request, 'dateslot', themessage)

    validation_result = validate_manager_availability(slots, the_manager)
    if not validation_result['isValid']:
        slots[validation_result['violatedSlot']] = None
        return violated_slot(intent_request, validation_result)

    if (not the_date):
        hours = get_data('sp_demo_manager_hours', [the_manager, 0, intv_len])
        inter =  get_data('sp_get_mg_interview', [the_manager])
        thedates = availability(hours, inter, intv_len)

        theresult = []
        for row in thedates:
            theresult.append(row[0].strftime('%m/%d/%Y %I:%M %p') + ' - ' + row[1].strftime('%I:%M %p'))

        values = ', '.join(str(v) for v in theresult)
        themessage = 'Please choose the date then time.  Which day would you like to interview? We have these slots available \n'  + values +  '.'

        if not thedates:
            validation_result = build_validation_result(False, 'dateslot', 'Error.  Manager not available.')
            slots[validation_result['violatedSlot']] = None
            return violated_slot(intent_request, validation_result)

        return pre_elicit_slot(intent_request, 'dateslot', themessage)

    if (not the_time):
        hours = get_data('sp_demo_manager_hours', [the_manager, the_date, intv_len])
        inter =  get_data('sp_get_mg_interview', [the_manager])
        thedates = availability(hours, inter, intv_len)

        theresult = []
        for row in thedates:
            theresult.append(row[0].strftime('%I:%M %p') + ' - ' + row[1].strftime('%I:%M %p'))

        values = ', '.join(str(v) for v in theresult)

        themessage ='Which time would you like to schedule an interview? We have ' + values + ' available. Please specify am/pm in your answer.'
        return pre_elicit_slot(intent_request, 'timeslot', themessage)

    if (the_time and the_date and the_manager):

        newdate = datetime.datetime.strptime(the_date , '%Y-%m-%d')
        newtime = datetime.datetime.strptime(the_time, '%H:%M').time()
        combined_date = datetime.datetime.combine(newdate, newtime)
        logger.debug(combined_date)

        handle_stored_procecure('sp_set_interview', [the_user, the_manager, combined_date])
        
        rtn_msg = 'Thank you!  We will contact the recruiter and will be in touch with you soon!  In the meantime please take a minute to send your updated resume to info@adri-sys.com. \r'
 
        #send_confirmation(emailaddress)
        send_sms_email(emailaddress)

        return close(
            session_attributes,
            'Fulfilled',
            {
                'contentType': 'PlainText',
                'content': rtn_msg
            }
        )   

    raise Exception('Bombed out in the manager_availability_routine') 

def validate_manager_availability(slots, the_manager):
    logger.debug('validate_manager_availability')
    the_time = try_ex(lambda: slots['timeslot'])
    the_date = try_ex(lambda: slots['dateslot'])
    logger.debug('inside the validate_manager_availability')
    intv_len = 20

    if (the_date):
        hours = get_data('sp_demo_manager_hours', [the_manager, 0, intv_len])
        inter =  get_data('sp_get_mg_interview', [the_manager])
        thedates = availability(hours, inter, intv_len)

        newdate = datetime.datetime.strptime(the_date , '%Y-%m-%d')

        if (newdate.date() not in (d.date() for d, c, g in thedates)):
            return build_validation_result(False, 'dateslot', 'Please enter a date from the list above.')

    if (the_time):
        if(not isvallid_time(the_time)):
            return build_validation_result(False, 'timeslot', 'Please enter a valid time.')

        hours = get_data('sp_demo_manager_hours', [the_manager, the_date, intv_len])
        inter =  get_data('sp_get_mg_interview', [the_manager])
        thedates = availability(hours, inter, intv_len)

        newtime = datetime.datetime.strptime(the_time, '%H:%M').time()
        
        if (any((newtime >= row[0].time() and newtime <= row[2].time()) for row in thedates)):
            logger.debug('timeslot validated.')
        else: 
            return build_validation_result(False, 'timeslot', 'Please enter a start time that allows for a '+ str(intv_len) +' minute interview.')
            

    return {'isValid': True}

def dispatch(intent_request):
    logger.debug('dispatch userId={}, intentName={}'.format(intent_request['userId'], intent_request['currentIntent']['name']))
    
    session_attributes = intent_request['sessionAttributes'] if intent_request['sessionAttributes'] is not None else {}
    slots = intent_request['currentIntent']['slots']
    intent_name = intent_request['currentIntent']['name']
    step = slots['step'] 

    logger.debug('step .... ' + str(step))

    if (step == 0):
        logger.debug('into the get_availability_details')
        return get_availability_details(intent_request)

    elif (step == 1):
        logger.debug('into the follow_up_later')
        return follow_up_later(intent_request)

    elif (step == 2):
        logger.debug('into the intrested_in_job_fn')
        return intrested_in_job_fn(intent_request)

    elif (step == 3):
        logger.debug('into the get_contact_information')
        return get_contact_information(intent_request)

    elif (step == 4):
        logger.debug('into the manager_availability_routine')
        return manager_availability_routine(intent_request) 
    else:
        return get_availability_details(intent_request)

    raise Exception('Intent with name ' + intent_name + ' not supported')



    
def send_confirmation(the_email):

    payl= '{"emailaddress": "'+ the_email +'"}'
    logger.debug(payl)
    client = boto3.client('lambda')
    response = client.invoke(
        FunctionName="send_sms",
        InvocationType="Event",
        Payload=payl
    )
    logger.debug(response)

def lambda_handler(event, context):

    os.environ['TZ'] = 'America/New_York'
    time.tzset()
    #logger.debug('event.bot.name={}'.format(event['bot']['name']))

    logger.debug(event)
    logger.debug(context)

    return dispatch(event)

    










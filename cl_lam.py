import json
import boto3


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



def call_lambda():
	pass

response = client.invoke(
    ClientContext='MyApp',
    FunctionName='MyFunction',
    InvocationType='Event',
    LogType='Tail',
    Payload='fileb://file-path/input.json',
    Qualifier='1',
)

print(response)



import boto3

client = boto3.client('lambda')


response = client.invoke(
    FunctionName='string',
    InvocationType='Event'|'RequestResponse'|'DryRun',
    LogType='None'|'Tail',
    ClientContext='string',
    Payload=b'bytes'|file,
    Qualifier='string'
)
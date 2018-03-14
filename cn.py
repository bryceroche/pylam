



def lambda_handler(event, context):
    if 'ConnectToAgent' == event['currentIntent']['name']:
        return build_response("Ok, connecting you to an agent.")
    elif 'VoteEditor' == event['currentIntent']['name']:
        editor = event['currentIntent']['slots']['editor']
        resp = ddb.update_item(
            Key={"name": editor.lower()},
            UpdateExpression="ADD votes :incr",
            ExpressionAttributeValues={":incr": 1},
            ReturnValues="ALL_NEW"
        )
        msg = "Awesome, now {} has {} votes!".format(
            resp['Attributes']['name'],
            resp['Attributes']['votes'])
        return build_response(msg) Adri_Rocks1!


"timeslot": "12-28-17",
"dateslot": "10:00am",
"Location": "",
"Position": "",
"interested": "",
"laterdate": "",
"laterdateyn": "",
"emailaddress": "",
"name": "",
"emailexists": "",
"email": "",
"mobile": "",
"sms_email": "",
"step": "0",
"stepa": ""
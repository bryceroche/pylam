from twilio.rest import Client


def send_sms(to_num, themessage):
	from_num = "+14422374210"
	account_sid = "AC2465c193b99bee044572bcc388da25c2"
	auth_token  = "8258fab68ffe234e5e344a5f7d340673"

	client = Client(account_sid, auth_token)

	message = client.messages.create(
	    to= to_num, 
	    from_= from_num,
	    body= themessage)

	print(message.sid)

#send_sms('+14243746845', 'lil test')

import json
import boto3

def lambda_handler(event, context):
	client = boto3.client('lambda')
	response = client.invoke(
	    ClientContext="cool app",
	    FunctionName="writes3",
	    InvocationType="Event",
	    LogType="Tail",
	    Payload= '{"key1":"value1", "key2":"value2", "key3":"value3"}'
	)

	print response


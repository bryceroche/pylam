import boto3
import botocore

s3 = boto3.resource('s3')
mybucket = s3.Bucket('adritestbucket4')
"""
for object in mybucket.objects.all():
    #print(object)
    if(object.key[0:6] == 'images'):
    	
    	KEY = object.key
    	print KEY
    	s3.Bucket(mybucket).download_file(KEY, KEY)

"""

KEY = 'images/ajax-loader.gif'
s3.Bucket(mybucket).download_file(KEY, KEY)


aws s3 sync s3://adri-library01 /home/ubuntu/jon
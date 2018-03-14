

import boto3
s3 = boto3.resource('s3')

for b in s3.buckets.all():
   print b.name
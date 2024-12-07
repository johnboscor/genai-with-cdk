import boto3
from botocore.client import Config
import json
from datetime import datetime
import os

def lambda_handler(event, context):
    s3 = boto3.client('s3', config=Config(signature_version='s3v4'))
    filename = 'audiofile-' + datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    print(filename)
    presigned_url = s3.generate_presigned_url('put_object', 
                                              Params={'Bucket': os.environ['BUCKET_NAME'],        
                                                      'Key': filename},
                                              ExpiresIn=3600) # URL expires in 1 hour

    return {
        'statusCode': 200,
        'body': presigned_url
    }
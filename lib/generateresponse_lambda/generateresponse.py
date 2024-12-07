import boto3
import json
import os
import datetime
import logging
import string
import random
from botocore.config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

config = Config(read_timeout=10000)

region = os.environ['REGION']
bucket = os.environ['BUCKET']

s3_client = boto3.client('s3')

bedrock_client = boto3.client(
    service_name="bedrock-agent-runtime",
    region_name=region,
)

def lambda_handler(event, context):

    input = event['output_text']
    agent_id = os.environ['AGENT_ID']
    agent_alias_id = os.environ['AGENT_ALIAS_ID']
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
    session_id = event.get('session_id', random_string)

    date_time = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M")
    output_file = f'agent_response_file-{date_time}.txt'

    result = {"status": "ERROR"}
    
    try:
        response = bedrock_client.invoke_agent(
                    agentId=agent_id,
                    agentAliasId=agent_alias_id,
                    sessionId=session_id,
                    inputText=input,
                )
        completion = ""
    
        for event in response.get("completion"):
            chunk = event["chunk"]
            completion = completion + chunk["bytes"].decode()
            
        s3_client.put_object(
                Bucket=bucket,
                Key=output_file,
                Body=completion,
                ContentType='text/plain'
            )
            
        result = {
            'statusCode': 200,
            'session_id': session_id,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,access-control-allow-origin, Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': completion,
            'bucket': bucket,
            'summary_file': output_file,
        }
            
    except Exception as e:
        logger.error(f"Couldn't invoke agent. {e}")
        result["message"] = str(e)
    
    return result


import json
import datetime
import boto3
import os

region = os.environ['REGION']
bucket = os.environ['BUCKET']

bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    region_name=region
)

s3_client = boto3.client('s3')


def lambda_handler(event, context):
    input_file = event.get('transcribed_file', None)
    input_text = event.get('input_text', None)
    date_time = datetime.datetime.now().strftime("%Y-%m-%d-%H-%M")
    output_file = f'summary_file-{date_time}.txt'

    result = {"status": "FAILED"}

    try:
        if input_file:
            file_object = s3_client.get_object(Bucket=bucket, Key=input_file)
            convo = file_object['Body'].read().decode()
            if '.json' in input_file: # This is a file from transcribe lambda
                json_content = json.loads(convo)
                convo = json_content['results']['transcripts'][0]['transcript']

        elif input_text:
            convo = input_text
        else:
            raise ValueError("Missing input text")


        prompt = f"""Given the following template:

        <h4>Summary</h4>
        <p>[summary goes here]</p>
        <h4>Key issues in the conversation</h4>
        <ul>
        <li>[key issues as list]</li>
        </ul>

        Please provide a brief summary of the conversation in 1 - 3 sentences, then identify and provide a list of key issues in the following conversation.:
        {convo}"""

        prompt_new = prompt.replace('\n', '\\n')

        kwargs = {
            "modelId": "ai21.j2-ultra-v1",
            "contentType": "application/json",
            "accept": "*/*",
            "body": "{\"prompt\":\"" + prompt_new + "\",\"maxTokens\":400,\"temperature\":0.3,\"topP\":0.9,\"stopSequences\":[],\"countPenalty\":{\"scale\":0},\"presencePenalty\":{\"scale\":0},\"frequencyPenalty\":{\"scale\":0}}"
        }

        response = bedrock_runtime.invoke_model(**kwargs)
        response_body = json.loads(response.get('body').read())

        output = response_body.get('completions')[
            0].get('data').get('text')

        s3_client.put_object(
            Bucket=bucket,
            Key=output_file,
            Body=output,
            ContentType='text/plain'
        )
        result = {
            'statusCode': 200,
            'bucket': bucket,
            'summary_file': output_file,
            'output_text': output,
            'isBase64Encoded': False,
            'headers': {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Headers': 'Content-Type,access-control-allow-origin, Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': output
        }
    except ValueError as e:
        result['error'] = str(e)
    except Exception as e:
        result['error'] = f"An unexpected error occurred: {str(e)}"

    return result

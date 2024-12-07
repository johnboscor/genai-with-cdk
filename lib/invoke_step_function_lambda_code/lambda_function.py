import json
import boto3
import os

def lambda_handler(event, context):
    # Print the entire event for debugging
    object_key = event['pathParameters']['object_key']
    
    # Extract the state machine ARN from environment variables
    state_machine_arn = os.environ['STATE_MACHINE_ARN']

    # Initialize the Step Functions client
    sfn = boto3.client('stepfunctions')
    
    # Start execution of the state machine
    state_machine_response = sfn.start_sync_execution(
        stateMachineArn=state_machine_arn,
        input=json.dumps({'audio_file': object_key})        
    )
    parsed_output = json.loads(state_machine_response['output'])

    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': "Process completed successfully!",
            'output_file': str(parsed_output['summary_file']),
            'response': str(parsed_output['body'])
        })
    }
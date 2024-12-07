#!/usr/bin/env node
import { Tags, App } from 'aws-cdk-lib';
import { PrerequisitesStack } from '../lib/prerequisites';
import { SummarizeTextStack } from '../lib/summarizetext';
import { PreSignedUrlStack } from '../lib/presigned_url_api_and_lambda';
import { InvokeStepFunctionStack } from '../lib/invoke_step_function_api_and_lambda';
import { GenerateResponseStack } from '../lib/generateresponse';
import { TranscribeTextStack } from '../lib/transcribeAudio';
import { StateMachineBindingAllLambdaFunctionsStack } from '../lib/state_machine';


const app = new App();
Tags.of(app).add('nukeoptout', 'true');
Tags.of(app).add('owner', 'norcalgenaibootcamp-capstone-cs');

// Sets up the following prerequisites:
// 1. S3 bucket
// 2. boto3 Lambda layer
new PrerequisitesStack(app, 'PrerequisitesStack');

// Lambda function to convert the audio file into text(transcribe).
new TranscribeTextStack(app, 'TranscribeTextStack');

// Lambda function to generate a summary from the transcribed text
new SummarizeTextStack(app, 'SummarizeTextStack');

// Lambda function to generate presigned Url for S3 bucket
new PreSignedUrlStack(app, 'PreSignedUrlStack');

// Lambda function to generate and retrieve response from Bedrock LLM
new GenerateResponseStack(app, 'GenerateResponseStack')

// Lambda function to invoke state machine step functions
new InvokeStepFunctionStack(app, 'InvokeStepFunctionStack');

// State Machine
new StateMachineBindingAllLambdaFunctionsStack(app, 'StateMachineBindingAllLambdaFunctionsStack')
import  {App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';


export class StateMachineBindingAllLambdaFunctionsStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
      super(scope, id, props);

      // import lambda ARNs
    const transcribe_lambda_arn = Fn.importValue('TranscribeLambdaARN')
    const summarize_lambda_arn = Fn.importValue('SummarizeLambdaARN')
    const generateresponse_lambda_arn = Fn.importValue('GenerateResponseLambdaARN')

     // IAM role for state machine execution 
     const StateMachineExecutionRole = new iam.Role(this, 'StateMachineExecutionRole', {
        assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
        description: 'An IAM role to Allow AWS Step Functions to invoke Lambda functions',
      });

    const LogGroupForExpress = new LogGroup(this, 'ExpressLogs', {
        retention: RetentionDays.ONE_DAY,
        removalPolicy: RemovalPolicy.DESTROY,
      });
    
     // define state machine invoking three lambda functions
      const stateMachine = new sfn.StateMachine(this, 'GenAIStateMachine', {
        role:StateMachineExecutionRole,
        stateMachineType:sfn.StateMachineType.EXPRESS,
        logs: {
            destination: LogGroupForExpress,
            level: sfn.LogLevel.ALL,
            includeExecutionData: true,
        },
        definition: new tasks.LambdaInvoke(this, 'transcribe_lambda', 
        {
            lambdaFunction: lambda.Function.fromFunctionArn(this,'transcribe_lambda_arn',transcribe_lambda_arn),
            stateName: 'Convert Audio to Text',
            invocationType: tasks.LambdaInvocationType.REQUEST_RESPONSE,
            outputPath: '$.Payload'
        }
        ).next(
            new tasks.LambdaInvoke(this, 'summarize_lambda', {
                lambdaFunction: lambda.Function.fromFunctionArn(this,'summarize_lambda_arn',summarize_lambda_arn),
                stateName:'Convert Full Text to Summary',
                invocationType:tasks.LambdaInvocationType.REQUEST_RESPONSE,
                inputPath:'$',
                outputPath:'$.Payload'
            })
        ).next(
            new tasks.LambdaInvoke(this, 'generateresponse_lambda', {
                lambdaFunction: lambda.Function.fromFunctionArn(this,'generateresponse_lambda_arn',generateresponse_lambda_arn),
                stateName:'Convert Summary to Response',
                invocationType:tasks.LambdaInvocationType.REQUEST_RESPONSE,
                inputPath:'$',
                outputPath:'$.Payload'
            }
            ).next(new sfn.Succeed(this, "Workflow Completed"))
        )
      });

      new CfnOutput(this, 'StateMachineARN', {
        exportName: 'StateMachineARN',
        value: stateMachine.stateMachineArn
        })
    
    }
  }
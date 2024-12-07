import  {App, Stack, StackProps} from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';

export class InvokeStepFunctionStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const imported_stepfunction_arn = Fn.importValue('StateMachineARN');
  
    const importedStateMachine = StateMachine.fromStateMachineArn(this, 'MyImportedStateMachine', imported_stepfunction_arn);

    // IAM Role for Lambda Execution
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'An IAM role for Lambda to call step functions',
    });

    // Policy to allow Lambda to call step functions
    lambdaExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [imported_stepfunction_arn],
      actions: [
        'states:StartSyncExecution',
      ],
    }));   

    lambdaExecutionRole.addToPolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
      }));

    // Define the Lambda function that invokes the Step Functions state machine
    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      role: lambdaExecutionRole,
      runtime: lambda.Runtime.PYTHON_3_12, // Use Python runtime
      timeout: Duration.minutes(5),
      code: lambda.Code.fromAsset('./lib/invoke_step_function_lambda_code'), // Assuming the Python code is in the 'lambda' directory
      handler: 'lambda_function.lambda_handler', // Assuming the file is named 'lambda_function.py' and the handler function is named 'lambda_handler'
      environment: {
        STATE_MACHINE_ARN: importedStateMachine.stateMachineArn, // Pass the State Machine ARN as an environment variable
      },
    });

    // Grant the Lambda function permission to execute the state machine
    importedStateMachine.grantStartExecution(lambdaFunction);

    // Define the API Gateway and map URL parameters to the Lambda event
    const api = new apigw.RestApi(this, 'APIGateway', {
      restApiName: 'InvokeStepfunctionAPI',
    });

    const resource = api.root.addResource('{object_key}'); // Capture `object_key` path parameter
    const integration = new apigw.LambdaIntegration(lambdaFunction, {
      requestTemplates: {
        'application/json': JSON.stringify({
          input: {
            object_key: "$util.escapeJavaScript($input.params('object_key'))"
          }
        })
      },
    });
    resource.addMethod('GET', integration); // Add GET method to invoke the Lambda
  }
}

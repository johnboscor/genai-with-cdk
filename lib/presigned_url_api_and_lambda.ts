import  {App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway"

export class PreSignedUrlStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define the S3 bucket
    const imported_bucket_arn = Fn.importValue('MainS3BucketArn'); 
    const imported_bucket_name = Fn.importValue('MainS3BucketName'); 

    // IAM Role for Lambda Execution
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'An IAM role for Lambda to access S3 services',
    });

    // Policy to allow Lambda to generate pre-signed URLs and log to CloudWatch
    lambdaExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [imported_bucket_arn, `${imported_bucket_arn}/*`],
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:AbortMultipartUpload',
        's3:ListBucket',
        's3:ListBucketMultipartUploads',
        's3:ListMultipartUploadParts',
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

    // Import boto3 to run python with AWS APIs
    const boto3_layer_arn = Fn.importValue('Boto3layerArn')
    const boto3_layer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3-layer', boto3_layer_arn)

    // Create the lambda function to generate summary data  
    const lambda_function = new lambda.Function(this, 'PresignedUrlLambda',
      {
        role: lambdaExecutionRole,
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: 'lambda_function.lambda_handler',
        timeout: Duration.minutes(5),
        code: lambda.Code.fromAsset('./lib/presigned_url_lambda'),
        layers: [boto3_layer],
        environment: {
          'REGION': this.region,
          'BUCKET_NAME': imported_bucket_name
        }
      },
    )

    // Necessary permissions to successfully execute the function.  
    lambda_function.addPermission('Invoke-permission',
      {
        action: 'lambda:InvokeFunction',
        principal: new iam.AnyPrincipal()
      })

    // Define the API Gateway REST API
    const api = new apigw.RestApi(this, 'PresignedUrlApi', {
      restApiName: 'Presigned Url',
      description: 'This service gets the Presigned Url.'
    });

    // Add a GET method to the API Gateway
    api.root.addMethod('GET', new LambdaIntegration (lambda_function));

    // These can now be imported into any stack as required.  
    new CfnOutput(this, 'PresignedUrlApiUrl', {
      exportName: 'PresignedUrlApiUrl',
      value: api.url 
    })
  }
}
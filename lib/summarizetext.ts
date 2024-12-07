import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';

// Used LLM from AWS Bedrock to get a summary of input data and store
// the summary in the S3 bucket. 
// Inputs: Bucket name and input file.
// Outputs: Summary Text stored into the input bucket name.
export class SummarizeTextStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    //Get the buckets and lambda layer   
    const bucket_arn = Fn.importValue('MainS3BucketArn')
    const bucket_name = Fn.importValue('MainS3BucketName')
    const boto3_layer_arn = Fn.importValue('Boto3layerArn')
    const boto3_layer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3-layer', boto3_layer_arn)

    // Create the lambda function to generate summary data  
    const lambda_function = new lambda.Function(this, 'summarizeFunction',
      {
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: 'summarize_function.lambda_handler',
        timeout: Duration.minutes(5),
        code: lambda.Code.fromAsset('./lib/summarizetext_lambda'),
        layers: [boto3_layer],
        environment: {
          'REGION': this.region,
          'BUCKET': bucket_name
        }
      },
    )

    // Necessary permissions to successfully execute the function.  
    lambda_function.addPermission('Invoke-permission',
      {
        action: 'lambda:InvokeFunction',
        principal: new iam.AnyPrincipal()
      })

    lambda_function.addToRolePolicy(new iam.PolicyStatement(
      {
        actions: ['bedrock:InvokeModel'],
        resources: [`arn:aws:bedrock:${this.region}::foundation-model/ai21.j2-ultra-v1`],
        effect: iam.Effect.ALLOW
      }))

    lambda_function.addToRolePolicy(new iam.PolicyStatement(
      {
        actions: ['s3:*'],
        resources: [bucket_arn + '/*'],
        effect: iam.Effect.ALLOW
      }))

    new CfnOutput(this, 'SummarizeLambdaARN', {
      exportName: 'SummarizeLambdaARN',
      value: lambda_function.functionArn
      })
  }
}

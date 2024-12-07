import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';

// Call the lambda function that transcribes audio to text
// Inputs: Bucket name and input file.
// Outputs: Transcription (stored in the same bucket as audio file)

export class TranscribeTextStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    //Get the buckets and lambda layer   
    const bucket_arn = Fn.importValue('MainS3BucketArn')
    const bucket_name = Fn.importValue('MainS3BucketName')
    const boto3_layer_arn = Fn.importValue('Boto3layerArn')
    const boto3_layer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3-layer', boto3_layer_arn)

    // Create the lambda function to generate transcription 
    const lambda_function = new lambda.Function(this, 'transcribe_function',
      {
        runtime: lambda.Runtime.PYTHON_3_11,
        handler: 'transcribe_function.lambda_handler',
        timeout: Duration.minutes(5),
        code: lambda.Code.fromAsset('./lib/transcribe_audio_lambda'),
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
        actions: ['transcribe:*'],
        resources: ['*'],
        effect: iam.Effect.ALLOW
      }))

    lambda_function.addToRolePolicy(new iam.PolicyStatement(
      {
        actions: ['s3:*'],
        resources: [bucket_arn + '/*'],
        effect: iam.Effect.ALLOW
      }))

    new CfnOutput(this, 'TranscribeLambdaARN', {
      exportName: 'TranscribeLambdaARN',
      value: lambda_function.functionArn
      })

  }
}

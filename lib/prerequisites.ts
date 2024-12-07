import  {App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export class PrerequisitesStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 bucket use to store various artifacts  
    const bucket = new s3.Bucket(this, 'capstoneprojectbucket', {
      removalPolicy: RemovalPolicy.DESTROY, 
    });

    // Lamdba resources to create boto3 layer
    const boto3_lambda_layer = new lambda.LayerVersion(this, 'Boto3LambdaLayer', {
      code: lambda.Code.fromAsset('./lambda_layers/boto3-layer.zip'), 
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_11], 
      description: 'Boto3 Library',
    });

    // These can now be imported into any stack as required.  
    new CfnOutput(this, 'BucketArn', {
      exportName: 'MainS3BucketArn',
      value: bucket.bucketArn
    })

    new CfnOutput(this, 'BucketName', {
      exportName: 'MainS3BucketName',
      value: bucket.bucketName
    })

    new CfnOutput(this, 'boto3layerarn', {
      exportName: 'Boto3layerArn',
      value: boto3_lambda_layer.layerVersionArn
    })



  }
}

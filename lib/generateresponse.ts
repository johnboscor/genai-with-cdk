import { App, CfnOutput, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';
import { Condition } from 'aws-cdk-lib/aws-stepfunctions';

export class GenerateResponseStack extends Stack {
    constructor(scope: App, id: string, props?: StackProps) {
        super(scope, id, props);

        //Get the buckets and lambda layer   
        const bucket_arn = Fn.importValue('MainS3BucketArn')
        const bucket_name = Fn.importValue('MainS3BucketName')
        const boto3_layer_arn = Fn.importValue('Boto3layerArn')
        const boto3_layer = lambda.LayerVersion.fromLayerVersionArn(this, 'boto3-layer', boto3_layer_arn)
        const agent_id = "XBYYPBZPMF"
        const agent_alias_id = "HMWC70ERC2"

        // define AWS Lambda resource to invoke bedrock agent and generate response
        const generateresponse = new lambda.Function(this, 'GenerateResponseHandler', 
            {
                runtime: lambda.Runtime.PYTHON_3_11,
                code: lambda.Code.fromAsset('./lib/generateresponse_lambda'),
                handler: 'generateresponse.lambda_handler',
                timeout: Duration.minutes(5),
                layers: [boto3_layer],
                environment: {
                    'REGION': this.region,
                    'BUCKET': bucket_name,
                    'AGENT_ID': agent_id,
                    'AGENT_ALIAS_ID': agent_alias_id
                }
            },
        )

        //Permissions for executing the lambda function
        generateresponse.addToRolePolicy(new iam.PolicyStatement(
            {
                actions: ["bedrock:*"],
                resources: ['*'],
                effect: iam.Effect.ALLOW
                
            }
        ))

        generateresponse.addToRolePolicy(new iam.PolicyStatement(
            {
              actions: ['s3:*'],
              resources: [bucket_arn + '/*'],
              effect: iam.Effect.ALLOW
            }))

        generateresponse.addToRolePolicy(new iam.PolicyStatement(
            {
                actions: [
                    "iam:ListRoles",
                    "ec2:DescribeVpcs",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeSecurityGroups"
                ],
                resources: ["*"],
                effect: iam.Effect.ALLOW
            }
        ))

        new CfnOutput(this, 'GenerateResponseLambdaARN', {
            exportName: 'GenerateResponseLambdaARN',
            value: generateresponse.functionArn
            })
        }
    }
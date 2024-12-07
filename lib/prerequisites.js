"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrerequisitesStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_cdk_lib_2 = require("aws-cdk-lib");
class PrerequisitesStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 bucket use to store various artifacts  
        const s3Bucket = new aws_cdk_lib_2.aws_s3.Bucket(this, 'capstoneprojectbucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Lamdba resources to create boto3 layer
        const boto3Layer = new aws_cdk_lib_1.aws_lambda.LayerVersion(this, 'Boto3LambdaLayer', {
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('./lambda_layers/boto3-layer.zip'),
            compatibleRuntimes: [aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11],
            description: 'Boto3 Library',
        });
    }
}
exports.PrerequisitesStack = PrerequisitesStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcmVxdWlzaXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByZXJlcXVpc2l0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDZDQUFtRDtBQUNuRCw2Q0FBMkM7QUFHM0MsTUFBYSxrQkFBbUIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMvQyxZQUFZLEtBQWMsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDNUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNkNBQTZDO1FBQzdDLE1BQU0sUUFBUSxHQUFHLElBQUksb0JBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQzVELGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87U0FDekMsQ0FBQyxDQUFDO1FBRUgseUNBQXlDO1FBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUksd0JBQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ25FLElBQUksRUFBRSx3QkFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUM7WUFDOUQsa0JBQWtCLEVBQUUsQ0FBQyx3QkFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7WUFDaEQsV0FBVyxFQUFFLGVBQWU7U0FDN0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaEJELGdEQWdCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBhd3NfbGFtYmRhIGFzIGxhbWJkYSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19zMyBhcyBzMyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IGF3c19pYW0gYXMgaWFtIH0gZnJvbSAnYXdzLWNkay1saWInO1xuXG5leHBvcnQgY2xhc3MgUHJlcmVxdWlzaXRlc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIFMzIGJ1Y2tldCB1c2UgdG8gc3RvcmUgdmFyaW91cyBhcnRpZmFjdHMgIFxuICAgIGNvbnN0IHMzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnY2Fwc3RvbmVwcm9qZWN0YnVja2V0Jywge1xuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgXG4gICAgfSk7XG5cbiAgICAvLyBMYW1kYmEgcmVzb3VyY2VzIHRvIGNyZWF0ZSBib3RvMyBsYXllclxuICAgIGNvbnN0IGJvdG8zTGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCAnQm90bzNMYW1iZGFMYXllcicsIHtcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnLi9sYW1iZGFfbGF5ZXJzL2JvdG8zLWxheWVyLnppcCcpLCBcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExXSwgXG4gICAgICBkZXNjcmlwdGlvbjogJ0JvdG8zIExpYnJhcnknLFxuICAgIH0pO1xuICB9XG59XG4iXX0=
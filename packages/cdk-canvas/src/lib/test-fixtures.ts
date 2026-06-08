import {CloudFormationTemplate} from './types';

/**
 * Sample CloudFormation template for testing.
 */
export const sampleTemplate: CloudFormationTemplate = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description: 'Sample stack for testing',
  Resources: {
    MyBucket: {
      Type: 'AWS::S3::Bucket',
      Properties: {
        BucketName: 'my-test-bucket',
      },
      Metadata: {
        'aws:cdk:path': 'TestStack/MyBucket/Resource',
      },
    },
    MyFunction: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: 'my-function',
        Runtime: 'nodejs18.x',
        Handler: 'index.handler',
        Code: {
          S3Bucket: {
            Ref: 'MyBucket',
          },
          S3Key: 'function.zip',
        },
      },
      Metadata: {
        'aws:cdk:path': 'TestStack/MyFunction/Resource',
      },
    },
    MyTable: {
      Type: 'AWS::DynamoDB::Table',
      Properties: {
        TableName: 'my-table',
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
        ],
      },
      Metadata: {
        'aws:cdk:path': 'TestStack/MyTable/Resource',
      },
    },
    MyRole: {
      Type: 'AWS::IAM::Role',
      Properties: {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        },
        ManagedPolicyArns: [
          {
            'Fn::GetAtt': ['MyTable', 'Arn'],
          },
        ],
      },
      DependsOn: ['MyTable'],
    },
  },
  Outputs: {
    BucketName: {
      Description: 'Name of the S3 bucket',
      Value: {
        Ref: 'MyBucket',
      },
      Export: {
        Name: 'MyStack-BucketName',
      },
    },
    FunctionArn: {
      Description: 'ARN of the Lambda function',
      Value: {
        'Fn::GetAtt': ['MyFunction', 'Arn'],
      },
    },
  },
  Parameters: {
    Environment: {
      Type: 'String',
      Default: 'development',
    },
  },
};

/**
 * Template with imported resources.
 */
export const templateWithImports: CloudFormationTemplate = {
  AWSTemplateFormatVersion: '2010-09-09',
  Resources: {
    MyVpc: {
      Type: 'AWS::EC2::VPC',
      Properties: {
        CidrBlock: '10.0.0.0/16',
      },
    },
    MySubnet: {
      Type: 'AWS::EC2::Subnet',
      Properties: {
        VpcId: {
          'Fn::ImportValue': 'SharedVpc',
        },
        CidrBlock: '10.0.1.0/24',
      },
    },
    MySecurityGroup: {
      Type: 'AWS::EC2::SecurityGroup',
      Properties: {
        GroupDescription: 'Test security group',
        VpcId: {
          Ref: 'MyVpc',
        },
      },
    },
  },
};

/**
 * Template with complex dependencies.
 */
export const templateWithDependencies: CloudFormationTemplate = {
  AWSTemplateFormatVersion: '2010-09-09',
  Resources: {
    ResourceA: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: 'resource-a',
      },
    },
    ResourceB: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: 'resource-b',
        Environment: {
          Variables: {
            RESOURCE_A_ARN: {
              'Fn::GetAtt': ['ResourceA', 'Arn'],
            },
          },
        },
      },
    },
    ResourceC: {
      Type: 'AWS::Lambda::Function',
      Properties: {
        FunctionName: 'resource-c',
        Environment: {
          Variables: {
            RESOURCE_B_NAME: {
              Ref: 'ResourceB',
            },
          },
        },
      },
      DependsOn: ['ResourceB'],
    },
  },
};

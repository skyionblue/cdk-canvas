import {describe, test, expect} from 'vitest';
import {detectImportedResources, extractExports} from './import-analyzer';
import {templateWithImports, sampleTemplate} from './test-fixtures';

describe('detectImportedResources', () => {
  test('should detect Fn::ImportValue references', () => {
    const imported = detectImportedResources(templateWithImports);

    expect(imported.has('SharedVpc')).toBe(true);
    expect(imported.size).toBe(1);
  });

  test('should handle templates with no imports', () => {
    const imported = detectImportedResources(sampleTemplate);

    expect(imported.size).toBe(0);
  });

  test('should handle nested ImportValue', () => {
    const template = {
      Resources: {
        MyResource: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Environment: {
              Variables: {
                VPC_ID: {
                  'Fn::ImportValue': 'SharedVpcId',
                },
                SUBNET_ID: {
                  'Fn::ImportValue': 'SharedSubnetId',
                },
              },
            },
          },
        },
      },
    };

    const imported = detectImportedResources(template);

    expect(imported.has('SharedVpcId')).toBe(true);
    expect(imported.has('SharedSubnetId')).toBe(true);
    expect(imported.size).toBe(2);
  });

  test('should handle ImportValue with Fn::Sub', () => {
    const template = {
      Resources: {
        MyResource: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            VpcId: {
              'Fn::ImportValue': {
                'Fn::Sub': '${StackName}-VpcId',
              },
            },
          },
        },
      },
    };

    const imported = detectImportedResources(template);

    expect(imported.has('${StackName}-VpcId')).toBe(true);
  });
});

describe('extractExports', () => {
  test('should extract exports from outputs', () => {
    const exports = extractExports(sampleTemplate);

    expect(exports.has('MyStack-BucketName')).toBe(true);
    expect(exports.get('MyStack-BucketName')).toBe('MyBucket');
  });

  test('should handle GetAtt in output value', () => {
    const exports = extractExports(sampleTemplate);

    // Only BucketName has Export, FunctionArn does not
    expect(exports.size).toBe(1);
  });

  test('should handle templates with no exports', () => {
    const template = {
      Resources: {
        MyResource: {
          Type: 'AWS::Lambda::Function',
          Properties: {},
        },
      },
    };

    const exports = extractExports(template);

    expect(exports.size).toBe(0);
  });

  test('should ignore outputs without export names', () => {
    const template = {
      Resources: {
        MyBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {},
        },
      },
      Outputs: {
        BucketName: {
          Value: {
            Ref: 'MyBucket',
          },
        },
      },
    };

    const exports = extractExports(template);

    expect(exports.size).toBe(0);
  });
});

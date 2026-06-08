import {describe, test, expect} from 'vitest';
import {parseStack, extractAllDependencies} from './stack-parser';
import {sampleTemplate, templateWithDependencies} from './test-fixtures';

describe('parseStack', () => {
  test('should parse basic stack structure', () => {
    const stack = parseStack('TestStack', sampleTemplate);

    expect(stack.name).toBe('TestStack');
    expect(Object.keys(stack.resources)).toHaveLength(4);
    expect(Object.keys(stack.outputs)).toHaveLength(2);
    expect(stack.parameters).toBeDefined();
  });

  test('should parse resource properties', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const bucket = stack.resources['MyBucket'];

    expect(bucket).toBeDefined();
    expect(bucket.id).toBe('MyBucket');
    expect(bucket.type).toBe('AWS::S3::Bucket');
    expect(bucket.properties).toHaveProperty('BucketName', 'my-test-bucket');
  });

  test('should extract CDK construct path from metadata', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const bucket = stack.resources['MyBucket'];

    expect(bucket.constructPath).toBe('TestStack/MyBucket/Resource');
  });

  test('should assign icon paths to resources', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const bucket = stack.resources['MyBucket'];
    const lambda = stack.resources['MyFunction'];

    expect(bucket.iconPath).toContain('Amazon-Simple-Storage-Service');
    expect(lambda.iconPath).toContain('AWS-Lambda');
  });

  test('should detect Ref dependencies', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const lambda = stack.resources['MyFunction'];

    expect(lambda.dependencies).toContain('MyBucket');
  });

  test('should detect GetAtt dependencies', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const role = stack.resources['MyRole'];

    expect(role.dependencies).toContain('MyTable');
  });

  test('should detect explicit DependsOn', () => {
    const stack = parseStack('TestStack', sampleTemplate);
    const role = stack.resources['MyRole'];

    expect(role.dependencies).toContain('MyTable');
  });

  test('should parse outputs', () => {
    const stack = parseStack('TestStack', sampleTemplate);

    expect(stack.outputs['BucketName']).toBeDefined();
    expect(stack.outputs['BucketName'].description).toBe(
      'Name of the S3 bucket',
    );
    expect(stack.outputs['BucketName'].exportName).toBe('MyStack-BucketName');
  });

  test('should not include AWS pseudo parameters in dependencies', () => {
    const template = {
      Resources: {
        MyResource: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Role: {
              Ref: 'AWS::AccountId',
            },
          },
        },
      },
    };

    const stack = parseStack('Test', template);
    const resource = stack.resources['MyResource'];

    expect(resource.dependencies).toHaveLength(0);
  });
});

describe('extractAllDependencies', () => {
  test('should extract all dependency types', () => {
    const deps = extractAllDependencies(templateWithDependencies.Resources);

    expect(deps).toHaveLength(3);

    const getAttDep = deps.find(
      (d) => d.source === 'ResourceB' && d.type === 'GetAtt',
    );
    expect(getAttDep).toBeDefined();
    expect(getAttDep?.target).toBe('ResourceA');

    const refDep = deps.find(
      (d) => d.source === 'ResourceC' && d.type === 'Ref',
    );
    expect(refDep).toBeDefined();
    expect(refDep?.target).toBe('ResourceB');

    const dependsOnDep = deps.find(
      (d) => d.source === 'ResourceC' && d.type === 'DependsOn',
    );
    expect(dependsOnDep).toBeDefined();
    expect(dependsOnDep?.target).toBe('ResourceB');
  });

  test('should handle nested property references', () => {
    const template = {
      Resources: {
        ResourceA: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            FunctionName: 'test',
          },
        },
        ResourceB: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Environment: {
              Variables: {
                NESTED: {
                  VALUE: {
                    Ref: 'ResourceA',
                  },
                },
              },
            },
          },
        },
      },
    };

    const deps = extractAllDependencies(template.Resources);

    expect(deps).toHaveLength(1);
    expect(deps[0].source).toBe('ResourceB');
    expect(deps[0].target).toBe('ResourceA');
    expect(deps[0].type).toBe('Ref');
  });

  test('should handle multiple DependsOn', () => {
    const template = {
      Resources: {
        ResourceA: {
          Type: 'AWS::Lambda::Function',
          Properties: {},
        },
        ResourceB: {
          Type: 'AWS::Lambda::Function',
          Properties: {},
        },
        ResourceC: {
          Type: 'AWS::Lambda::Function',
          Properties: {},
          DependsOn: ['ResourceA', 'ResourceB'],
        },
      },
    };

    const deps = extractAllDependencies(template.Resources);

    expect(deps).toHaveLength(2);
    expect(deps.filter((d) => d.source === 'ResourceC')).toHaveLength(2);
  });
});

import {describe, test, expect} from 'vitest';
import {
  getIconPath,
  getSupportedResourceTypes,
  hasCustomIcon,
} from './icon-mapper';

describe('getIconPath', () => {
  test('should return icon path for Lambda function', () => {
    const iconPath = getIconPath('AWS::Lambda::Function');

    expect(iconPath).toContain('AWS-Lambda');
    expect(iconPath).toContain('.svg');
  });

  test('should return icon path for S3 bucket', () => {
    const iconPath = getIconPath('AWS::S3::Bucket');

    expect(iconPath).toContain('Amazon-Simple-Storage-Service');
    expect(iconPath).toContain('.svg');
  });

  test('should return icon path for DynamoDB table', () => {
    const iconPath = getIconPath('AWS::DynamoDB::Table');

    expect(iconPath).toContain('Amazon-DynamoDB');
    expect(iconPath).toContain('.svg');
  });

  test('should return icon path for VPC', () => {
    const iconPath = getIconPath('AWS::EC2::VPC');

    expect(iconPath).toContain('Amazon-Virtual-Private-Cloud');
    expect(iconPath).toContain('.svg');
  });

  test('should return default icon for unknown type', () => {
    const iconPath = getIconPath('AWS::Unknown::Resource');

    expect(iconPath).toContain('AWS-CloudFormation');
    expect(iconPath).toContain('.svg');
  });

  test('should return consistent paths', () => {
    const path1 = getIconPath('AWS::Lambda::Function');
    const path2 = getIconPath('AWS::Lambda::Function');

    expect(path1).toBe(path2);
  });
});

describe('getSupportedResourceTypes', () => {
  test('should return array of resource types', () => {
    const types = getSupportedResourceTypes();

    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);
  });

  test('should include common resource types', () => {
    const types = getSupportedResourceTypes();

    expect(types).toContain('AWS::Lambda::Function');
    expect(types).toContain('AWS::S3::Bucket');
    expect(types).toContain('AWS::DynamoDB::Table');
    expect(types).toContain('AWS::EC2::VPC');
  });
});

describe('hasCustomIcon', () => {
  test('should return true for supported types', () => {
    expect(hasCustomIcon('AWS::Lambda::Function')).toBe(true);
    expect(hasCustomIcon('AWS::S3::Bucket')).toBe(true);
    expect(hasCustomIcon('AWS::DynamoDB::Table')).toBe(true);
  });

  test('should return false for unsupported types', () => {
    expect(hasCustomIcon('AWS::Unknown::Resource')).toBe(false);
    expect(hasCustomIcon('Custom::MyResource')).toBe(false);
  });
});

import {CdkStack} from '../types';

export type SecuritySeverity = 'critical' | 'warning';

export interface SecurityIssue {
  id: string;
  resourceId: string;
  resourceType: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  recommendation: string;
}

/**
 * Scan CDK stacks for common security issues.
 */
export function scanForSecurityIssues(
  stacks: Record<string, CdkStack>,
): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  Object.entries(stacks).forEach(([stackName, stack]) => {
    Object.entries(stack.resources).forEach(([resourceId, resource]) => {
      const fullResourceId = Object.keys(stacks).length > 1
        ? `${stackName}::${resourceId}`
        : resourceId;

      // Check Security Groups for 0.0.0.0/0
      if (resource.type === 'AWS::EC2::SecurityGroup') {
        const ingressRules = Array.isArray(resource.properties?.SecurityGroupIngress)
          ? resource.properties.SecurityGroupIngress
          : [];
        const egressRules = Array.isArray(resource.properties?.SecurityGroupEgress)
          ? resource.properties.SecurityGroupEgress
          : [];

        const checkRules = (rules: any[], direction: 'ingress' | 'egress') => {
          if (!Array.isArray(rules) || rules.length === 0) return;

          rules.forEach((rule: any, index: number) => {
            const cidrIp = rule.CidrIp || rule.CidrIpv6;
            if (cidrIp === '0.0.0.0/0' || cidrIp === '::/0') {
              issues.push({
                id: `${fullResourceId}-sg-open-${direction}-${index}`,
                resourceId: fullResourceId,
                resourceType: resource.type,
                severity: 'critical',
                title: `Open ${direction} to internet`,
                description: `Security group allows ${direction} traffic from 0.0.0.0/0`,
                recommendation: `Restrict ${direction} to specific IP ranges or security groups`,
              });
            }
          });
        };

        checkRules(ingressRules, 'ingress');
        checkRules(egressRules, 'egress');
      }

      // Check S3 buckets for public access
      if (resource.type === 'AWS::S3::Bucket') {
        const publicAccessBlock = resource.properties?.PublicAccessBlockConfiguration as any;

        if (!publicAccessBlock ||
            (publicAccessBlock as any).BlockPublicAcls !== true ||
            (publicAccessBlock as any).BlockPublicPolicy !== true ||
            (publicAccessBlock as any).IgnorePublicAcls !== true ||
            (publicAccessBlock as any).RestrictPublicBuckets !== true) {
          issues.push({
            id: `${fullResourceId}-s3-public`,
            resourceId: fullResourceId,
            resourceType: resource.type,
            severity: 'critical',
            title: 'S3 bucket allows public access',
            description: 'Bucket does not have all public access blocks enabled',
            recommendation: 'Enable all PublicAccessBlockConfiguration settings',
          });
        }

        // Check for encryption
        const encryption = resource.properties?.BucketEncryption;
        if (!encryption) {
          issues.push({
            id: `${fullResourceId}-s3-encryption`,
            resourceId: fullResourceId,
            resourceType: resource.type,
            severity: 'warning',
            title: 'S3 bucket not encrypted',
            description: 'Bucket does not have server-side encryption enabled',
            recommendation: 'Enable AES256 or KMS encryption',
          });
        }
      }

      // Check RDS for public accessibility
      if (
        resource.type === 'AWS::RDS::DBInstance' ||
        resource.type === 'AWS::RDS::DBCluster'
      ) {
        if (resource.properties?.PubliclyAccessible === true) {
          issues.push({
            id: `${fullResourceId}-rds-public`,
            resourceId: fullResourceId,
            resourceType: resource.type,
            severity: 'critical',
            title: 'Database publicly accessible',
            description: 'RDS instance/cluster is publicly accessible from the internet',
            recommendation: 'Set PubliclyAccessible to false and use VPN or bastion host',
          });
        }
      }

      // Check IAM roles for wildcard permissions
      if (resource.type === 'AWS::IAM::Role') {
        const policies = resource.properties?.Policies || [];

        if (Array.isArray(policies)) {
          policies.forEach((policy: any, index: number) => {
            const statements = policy?.PolicyDocument?.Statement || [];

            if (Array.isArray(statements)) {
              statements.forEach((statement: any, stmtIndex: number) => {
                if (statement.Effect === 'Allow') {
                  const actions = Array.isArray(statement.Action)
                    ? statement.Action
                    : [statement.Action];
                  const resources = Array.isArray(statement.Resource)
                    ? statement.Resource
                    : [statement.Resource];

                  if (actions.includes('*') || resources.includes('*')) {
                    issues.push({
                      id: `${fullResourceId}-iam-wildcard-${index}-${stmtIndex}`,
                      resourceId: fullResourceId,
                      resourceType: resource.type,
                      severity: 'warning',
                      title: 'IAM role has wildcard permissions',
                      description: 'Role policy uses * for actions or resources',
                      recommendation: 'Use principle of least privilege with specific actions and resources',
                    });
                  }
                }
              });
            }
          });
        }
      }

      // Check Lambda functions for public URLs
      if (resource.type === 'AWS::Lambda::Url') {
        const authType = resource.properties?.AuthType;
        if (authType === 'NONE') {
          issues.push({
            id: `${fullResourceId}-lambda-url-public`,
            resourceId: fullResourceId,
            resourceType: resource.type,
            severity: 'warning',
            title: 'Lambda function URL has no authentication',
            description: 'Function URL allows unauthenticated access',
            recommendation: 'Enable IAM authentication or use API Gateway with auth',
          });
        }
      }
    });
  });

  return issues;
}

/**
 * Group security issues by resource ID.
 */
export function groupIssuesByResource(
  issues: SecurityIssue[],
): Map<string, SecurityIssue[]> {
  const grouped = new Map<string, SecurityIssue[]>();

  issues.forEach((issue) => {
    const existing = grouped.get(issue.resourceId) || [];
    grouped.set(issue.resourceId, [...existing, issue]);
  });

  return grouped;
}

/**
 * Get summary statistics for security issues.
 */
export function getSecuritySummary(issues: SecurityIssue[]) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const affectedResources = new Set(issues.map((i) => i.resourceId)).size;

  return {
    total: issues.length,
    critical,
    warnings,
    affectedResources,
  };
}

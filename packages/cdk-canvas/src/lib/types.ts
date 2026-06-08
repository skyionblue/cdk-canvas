/**
 * CloudFormation resource types for AWS services.
 */
export type ResourceType = string; // AWS::EC2::Instance, AWS::Lambda::Function, etc.

/**
 * Represents a parsed CDK resource from CloudFormation template.
 */
export interface CdkResource {
  /**
   * CloudFormation logical ID.
   */
  readonly id: string;

  /**
   * CloudFormation resource type (e.g., AWS::EC2::Instance).
   */
  readonly type: ResourceType;

  /**
   * Resource properties from CloudFormation template.
   */
  readonly properties: Record<string, unknown>;

  /**
   * CDK construct path from metadata.
   */
  readonly constructPath?: string;

  /**
   * Path to AWS icon for this resource type.
   */
  readonly iconPath?: string;

  /**
   * Whether this resource is imported from another stack.
   */
  readonly isImported: boolean;

  /**
   * List of resource IDs this resource depends on.
   */
  readonly dependencies: string[];

  /**
   * Stack name (for multi-stack diagrams).
   */
  stackName?: string;

  /**
   * Original resource ID before stack prefixing.
   */
  originalId?: string;
}

/**
 * CloudFormation output definition.
 */
export interface CdkOutput {
  /**
   * Output logical ID.
   */
  readonly id: string;

  /**
   * Output description.
   */
  readonly description?: string;

  /**
   * Output value (can contain intrinsic functions).
   */
  readonly value: unknown;

  /**
   * Export name for cross-stack references.
   */
  readonly exportName?: string;
}

/**
 * Parsed CDK stack with enriched metadata.
 */
export interface CdkStack {
  /**
   * Stack name from template file.
   */
  readonly name: string;

  /**
   * Map of resource logical ID to parsed resource.
   */
  readonly resources: Record<string, CdkResource>;

  /**
   * Stack outputs.
   */
  readonly outputs: Record<string, CdkOutput>;

  /**
   * Stack parameters.
   */
  readonly parameters?: Record<string, unknown>;
}

/**
 * Dependency edge between resources.
 */
export interface ResourceDependency {
  /**
   * Source resource ID.
   */
  readonly source: string;

  /**
   * Target resource ID.
   */
  readonly target: string;

  /**
   * Type of dependency (Ref, GetAtt, DependsOn).
   */
  readonly type: 'Ref' | 'GetAtt' | 'DependsOn';
}

/**
 * Raw CloudFormation template structure.
 */
export interface CloudFormationTemplate {
  readonly AWSTemplateFormatVersion?: string;
  readonly Description?: string;
  readonly Parameters?: Record<string, unknown>;
  readonly Resources: Record<string, CloudFormationResource>;
  readonly Outputs?: Record<string, CloudFormationOutput>;
  readonly Metadata?: Record<string, unknown>;
}

/**
 * CloudFormation resource definition.
 */
export interface CloudFormationResource {
  readonly Type: string;
  readonly Properties?: Record<string, unknown>;
  readonly DependsOn?: string | string[];
  readonly Metadata?: {
    readonly 'aws:cdk:path'?: string;
    [key: string]: unknown;
  };
}

/**
 * CloudFormation output definition.
 */
export interface CloudFormationOutput {
  readonly Description?: string;
  readonly Value: unknown;
  readonly Export?: {
    readonly Name: string;
  };
}

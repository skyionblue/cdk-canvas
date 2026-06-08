/**
 * CDK resource from parsed stack.
 */
export interface CdkResource {
  readonly id: string;
  readonly type: string;
  readonly properties: Record<string, unknown>;
  readonly constructPath?: string;
  readonly iconPath?: string;
  readonly isImported: boolean;
  readonly dependencies: string[];
}

/**
 * CDK output.
 */
export interface CdkOutput {
  readonly id: string;
  readonly description?: string;
  readonly value: unknown;
  readonly exportName?: string;
}

/**
 * Parsed CDK stack.
 */
export interface CdkStack {
  readonly name: string;
  readonly resources: Record<string, CdkResource>;
  readonly outputs: Record<string, CdkOutput>;
  readonly parameters?: Record<string, unknown>;
}

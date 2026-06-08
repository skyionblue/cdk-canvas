import {
  CdkStack,
  CdkResource,
  CdkOutput,
  CloudFormationTemplate,
  CloudFormationResource,
  ResourceDependency,
} from './types';
import {getIconPath} from './icon-mapper';
import {detectImportedResources} from './import-analyzer';

/**
 * Parse a CloudFormation template into enriched CDK stack data.
 *
 * @param stackName - Name of the stack
 * @param template - Raw CloudFormation template
 * @returns Parsed CDK stack with enriched metadata
 */
export function parseStack(
  stackName: string,
  template: CloudFormationTemplate,
): CdkStack {
  const resources: Record<string, CdkResource> = {};
  const dependencies = extractDependencies(template.Resources);
  const importedResourceIds = detectImportedResources(template);

  for (const [logicalId, resource] of Object.entries(template.Resources)) {
    if (resource.Type === 'AWS::CDK::Metadata') {
      continue;
    }

    resources[logicalId] = parseResource(
      logicalId,
      resource,
      dependencies,
      importedResourceIds,
    );
  }

  const outputs: Record<string, CdkOutput> = {};
  if (template.Outputs) {
    for (const [outputId, output] of Object.entries(template.Outputs)) {
      outputs[outputId] = {
        id: outputId,
        description: output.Description,
        value: output.Value,
        exportName: output.Export?.Name,
      };
    }
  }

  return {
    name: stackName,
    resources,
    outputs,
    parameters: template.Parameters,
  };
}

/**
 * Parse a single CloudFormation resource.
 *
 * @param logicalId - CloudFormation logical ID
 * @param resource - CloudFormation resource definition
 * @param dependencies - Map of resource dependencies
 * @returns Parsed CDK resource
 */
function parseResource(
  logicalId: string,
  resource: CloudFormationResource,
  dependencies: Map<string, string[]>,
  importedResourceIds: Set<string>,
): CdkResource {
  return {
    id: logicalId,
    type: resource.Type,
    properties: resource.Properties ?? {},
    constructPath: resource.Metadata?.['aws:cdk:path'],
    iconPath: getIconPath(resource.Type),
    isImported: importedResourceIds.has(logicalId),
    dependencies: dependencies.get(logicalId) ?? [],
  };
}

/**
 * Extract dependencies from CloudFormation resources.
 * Scans for Ref, Fn::GetAtt, and DependsOn.
 *
 * @param resources - CloudFormation resources
 * @returns Map of resource ID to list of dependency IDs
 */
function extractDependencies(
  resources: Record<string, CloudFormationResource>,
): Map<string, string[]> {
  const dependencyMap = new Map<string, string[]>();

  for (const [logicalId, resource] of Object.entries(resources)) {
    const deps = new Set<string>();

    if (resource.DependsOn) {
      const dependsOn = Array.isArray(resource.DependsOn)
        ? resource.DependsOn
        : [resource.DependsOn];
      dependsOn.forEach((dep) => deps.add(dep));
    }

    if (resource.Properties) {
      findReferences(resource.Properties, deps);
    }

    dependencyMap.set(logicalId, Array.from(deps));
  }

  return dependencyMap;
}

/**
 * Recursively find Ref and Fn::GetAtt references in an object.
 *
 * @param obj - Object to scan
 * @param deps - Set to accumulate dependency IDs
 */
function findReferences(obj: unknown, deps: Set<string>): void {
  if (obj === null || obj === undefined) {
    return;
  }

  if (typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findReferences(item, deps));
    return;
  }

  const record = obj as Record<string, unknown>;

  if ('Ref' in record && typeof record.Ref === 'string') {
    // Only add if it's not a pseudo parameter (AWS::*)
    if (!record.Ref.startsWith('AWS::')) {
      deps.add(record.Ref);
    }
    return;
  }

  if ('Fn::GetAtt' in record) {
    const getAtt = record['Fn::GetAtt'];
    if (Array.isArray(getAtt) && getAtt.length > 0) {
      const resourceId = getAtt[0];
      if (typeof resourceId === 'string') {
        deps.add(resourceId);
      }
    }
    return;
  }

  for (const value of Object.values(record)) {
    findReferences(value, deps);
  }
}

/**
 * Extract all dependencies with their types.
 *
 * @param resources - CloudFormation resources
 * @returns Array of resource dependencies
 */
export function extractAllDependencies(
  resources: Record<string, CloudFormationResource>,
): ResourceDependency[] {
  const dependencies: ResourceDependency[] = [];

  for (const [logicalId, resource] of Object.entries(resources)) {
    // Add explicit DependsOn
    if (resource.DependsOn) {
      const dependsOn = Array.isArray(resource.DependsOn)
        ? resource.DependsOn
        : [resource.DependsOn];
      dependsOn.forEach((target) => {
        dependencies.push({
          source: logicalId,
          target,
          type: 'DependsOn',
        });
      });
    }

    // Find Ref and GetAtt in properties
    if (resource.Properties) {
      const refs = new Set<string>();
      const getAtts = new Set<string>();
      findReferencesWithType(resource.Properties, refs, getAtts);

      refs.forEach((target) => {
        if (!target.startsWith('AWS::')) {
          dependencies.push({
            source: logicalId,
            target,
            type: 'Ref',
          });
        }
      });

      getAtts.forEach((target) => {
        dependencies.push({
          source: logicalId,
          target,
          type: 'GetAtt',
        });
      });
    }
  }

  return dependencies;
}

/**
 * Find references and categorize them by type.
 *
 * @param obj - Object to scan
 * @param refs - Set to accumulate Ref targets
 * @param getAtts - Set to accumulate GetAtt targets
 */
function findReferencesWithType(
  obj: unknown,
  refs: Set<string>,
  getAtts: Set<string>,
): void {
  if (obj === null || obj === undefined) {
    return;
  }

  if (typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findReferencesWithType(item, refs, getAtts));
    return;
  }

  const record = obj as Record<string, unknown>;

  if ('Ref' in record && typeof record.Ref === 'string') {
    refs.add(record.Ref);
    return;
  }

  if ('Fn::GetAtt' in record) {
    const getAtt = record['Fn::GetAtt'];
    if (Array.isArray(getAtt) && getAtt.length > 0) {
      const resourceId = getAtt[0];
      if (typeof resourceId === 'string') {
        getAtts.add(resourceId);
      }
    }
    return;
  }

  for (const value of Object.values(record)) {
    findReferencesWithType(value, refs, getAtts);
  }
}

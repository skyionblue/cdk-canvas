import {CloudFormationTemplate} from './types';

/**
 * Analyze a CloudFormation template to detect imported resources.
 * Resources are considered imported if they are referenced via Fn::ImportValue.
 *
 * @param template - CloudFormation template
 * @returns Set of resource IDs that are imported from other stacks
 */
export function detectImportedResources(
  template: CloudFormationTemplate,
): Set<string> {
  const importedResources = new Set<string>();

  // Scan all resources for Fn::ImportValue
  for (const resource of Object.values(template.Resources)) {
    if (resource.Properties) {
      findImportValues(resource.Properties, importedResources);
    }
  }

  return importedResources;
}

/**
 * Recursively find Fn::ImportValue references in an object.
 *
 * @param obj - Object to scan
 * @param imported - Set to accumulate imported resource identifiers
 */
function findImportValues(obj: unknown, imported: Set<string>): void {
  if (obj === null || obj === undefined) {
    return;
  }

  if (typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findImportValues(item, imported));
    return;
  }

  const record = obj as Record<string, unknown>;

  // Check for Fn::ImportValue
  if ('Fn::ImportValue' in record) {
    const importValue = record['Fn::ImportValue'];
    if (typeof importValue === 'string') {
      imported.add(importValue);
    } else if (
      typeof importValue === 'object' &&
      importValue !== null &&
      'Fn::Sub' in importValue
    ) {
      // Handle Fn::Sub case: Fn::ImportValue: !Sub "${StackName}-VpcId"
      const subValue = (importValue as Record<string, unknown>)['Fn::Sub'];
      if (typeof subValue === 'string') {
        imported.add(subValue);
      }
    }
    return;
  }

  // Recursively search nested objects
  for (const value of Object.values(record)) {
    findImportValues(value, imported);
  }
}

/**
 * Get exported values from stack outputs.
 *
 * @param template - CloudFormation template
 * @returns Map of export name to resource ID
 */
export function extractExports(
  template: CloudFormationTemplate,
): Map<string, string> {
  const exports = new Map<string, string>();

  if (!template.Outputs) {
    return exports;
  }

  for (const output of Object.values(template.Outputs)) {
    if (output.Export?.Name) {
      // Try to extract the resource ID from the output value
      const resourceId = extractResourceFromValue(output.Value);
      if (resourceId) {
        exports.set(output.Export.Name, resourceId);
      }
    }
  }

  return exports;
}

/**
 * Extract resource ID from an output value.
 * Handles Ref and Fn::GetAtt.
 *
 * @param value - Output value
 * @returns Resource ID if found
 */
function extractResourceFromValue(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  // Check for Ref
  if ('Ref' in record && typeof record.Ref === 'string') {
    return record.Ref;
  }

  // Check for Fn::GetAtt
  if ('Fn::GetAtt' in record) {
    const getAtt = record['Fn::GetAtt'];
    if (Array.isArray(getAtt) && getAtt.length > 0) {
      const resourceId = getAtt[0];
      if (typeof resourceId === 'string') {
        return resourceId;
      }
    }
  }

  return undefined;
}

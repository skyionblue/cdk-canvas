import {CdkStack, CdkResource} from './types';

/**
 * Result of merging multiple CDK stacks.
 */
export interface MergedStack {
  /**
   * Stack names that were merged.
   */
  readonly stackNames: string[];

  /**
   * All resources from all stacks, with stack prefix added to avoid conflicts.
   */
  readonly resources: Record<string, CdkResource>;

  /**
   * Map of prefixed resource ID to original stack name.
   */
  readonly resourceToStack: Record<string, string>;
}

/**
 * Merge multiple CDK stacks into a single unified view.
 *
 * Resources are prefixed with stack name to avoid ID conflicts.
 * Cross-stack dependencies are preserved.
 *
 * @param stacks - Map of stack name to parsed stack data
 * @returns Merged stack with all resources
 */
export function mergeStacks(stacks: Record<string, CdkStack>): MergedStack {
  const stackNames = Object.keys(stacks);
  const resources: Record<string, CdkResource> = {};
  const resourceToStack: Record<string, string> = {};

  // First pass: collect all resources with prefixed IDs
  for (const stackName of stackNames) {
    const stack = stacks[stackName];

    for (const [resourceId, resource] of Object.entries(stack.resources)) {
      const prefixedId = `${stackName}::${resourceId}`;
      resources[prefixedId] = {
        ...resource,
        stackName,
        originalId: resourceId,
      };
      resourceToStack[prefixedId] = stackName;
    }
  }

  // Second pass: update dependencies to use prefixed IDs
  for (const [prefixedId, resource] of Object.entries(resources)) {
    const stackName = resourceToStack[prefixedId];

    // Update dependencies array
    if (resource.dependencies && resource.dependencies.length > 0) {
      const updatedDeps = resource.dependencies.map((depId) => {
        // Check if this dependency is in the same stack
        const sameStackPrefixed = `${stackName}::${depId}`;
        if (resources[sameStackPrefixed]) {
          return sameStackPrefixed;
        }

        // Check if it's already prefixed from another stack
        if (resources[depId]) {
          return depId;
        }

        // Check all stacks for this resource
        for (const otherStackName of stackNames) {
          const crossStackPrefixed = `${otherStackName}::${depId}`;
          if (resources[crossStackPrefixed]) {
            return crossStackPrefixed;
          }
        }

        // Keep original if not found (might be external/imported)
        return depId;
      });

      // Create new object with updated dependencies
      resources[prefixedId] = {
        ...resource,
        dependencies: updatedDeps,
      };
    }
  }

  return {
    stackNames,
    resources,
    resourceToStack,
  };
}

/**
 * Get a shortened display name for a resource (removes stack prefix).
 *
 * @param prefixedId - Full prefixed resource ID
 * @returns Display name without stack prefix
 */
export function getResourceDisplayName(prefixedId: string): string {
  const parts = prefixedId.split('::');
  if (parts.length === 2) {
    return parts[1];
  }
  return prefixedId;
}

/**
 * Get the stack name from a prefixed resource ID.
 *
 * @param prefixedId - Full prefixed resource ID
 * @returns Stack name or null if not prefixed
 */
export function getStackFromResourceId(prefixedId: string): string | null {
  const parts = prefixedId.split('::');
  if (parts.length === 2) {
    return parts[0];
  }
  return null;
}

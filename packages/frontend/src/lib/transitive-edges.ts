import {Edge} from 'reactflow';

/**
 * Compute transitive edges when nodes are hidden.
 *
 * If A→B→C and B is hidden, create A→C edge.
 * This preserves connectivity in topology view when low-level resources are filtered out.
 *
 * @param edges - All edges (before filtering)
 * @param visibleNodeIds - Set of node IDs that are visible
 * @returns Filtered edges with transitive connections
 */
export function computeTransitiveEdges(
  edges: Edge[],
  visibleNodeIds: Set<string>,
): Edge[] {
  // If very few nodes are filtered, just filter edges directly (optimization)
  const allNodeIds = new Set<string>();
  edges.forEach((edge) => {
    allNodeIds.add(edge.source);
    allNodeIds.add(edge.target);
  });

  const hiddenCount = allNodeIds.size - visibleNodeIds.size;

  if (hiddenCount === 0) {
    // No nodes hidden, return all edges between visible nodes
    return edges.filter(
      (edge) =>
        visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
    );
  }

  // Build adjacency list
  const graph = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (!graph.has(edge.source)) {
      graph.set(edge.source, new Set());
    }
    graph.get(edge.source)!.add(edge.target);
  });

  // For each visible node, find all visible nodes it can reach
  const transitiveEdges = new Map<string, Set<string>>();

  visibleNodeIds.forEach((sourceId) => {
    const reachable = new Set<string>();
    const queue: string[] = [sourceId];
    const visited = new Set<string>();
    let traversedCount = 0;

    while (queue.length > 0 && traversedCount < 1000) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      traversedCount++;

      const neighbors = graph.get(currentId) || new Set();
      neighbors.forEach((neighborId) => {
        if (visited.has(neighborId)) return;

        if (visibleNodeIds.has(neighborId) && neighborId !== sourceId) {
          reachable.add(neighborId);
        } else if (!visibleNodeIds.has(neighborId)) {
          queue.push(neighborId);
        }
      });
    }

    if (reachable.size > 0) {
      transitiveEdges.set(sourceId, reachable);
    }
  });

  // Convert transitive edges map to Edge array
  const resultEdges: Edge[] = [];
  transitiveEdges.forEach((targets, source) => {
    targets.forEach((target) => {
      resultEdges.push({
        id: `${source}-${target}`,
        source,
        target,
        type: 'smoothstep',
        animated: false,
      });
    });
  });

  return resultEdges;
}

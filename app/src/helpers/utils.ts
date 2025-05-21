/**
  Utility functions for traversing and analyzing directed graph edges.
  Includes helpers like getUpstreamNodeIds to find all “ancestor” nodes
 */

import type { GraphEdge } from "./types";

export function getUpstreamNodeIds(
  startId: string,
  edges: GraphEdge[]
): string[] {
  const adj: Record<string, string[]> = {};
  for (const e of edges) {
    adj[e.target] = adj[e.target] || [];
    adj[e.target].push(e.source);
  }
  const visited = new Set<string>();

  function dfs(id: string) {
    (adj[id] || []).forEach(src => {
      if (!visited.has(src)) {
        visited.add(src);
        dfs(src);
      }
    });
  }

  dfs(startId);
  return Array.from(visited);
}

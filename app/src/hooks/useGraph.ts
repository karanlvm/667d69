import { useEffect, useState } from "react";
import type { Graph } from "../helpers/types";

export function useGraph(url: string) {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(setGraph)
      .catch(err => setError(String(err)));
  }, [url]);

  return { graph, error };
}

import React, { useEffect, useState } from "react";
import type { Graph } from "./utils/types";

export default function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/123/actions/blueprints/bp_456/bpv_123/graph")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Graph>;
      })
      .then(setGraph)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p style={{color:"red"}}>Error: {error}</p>;
  if (!graph) return <p>Loading graph…</p>;

  return (
    <pre style={{whiteSpace: "pre-wrap", padding: 20}}>
      {JSON.stringify(graph, null, 2)}
    </pre>
  );
}

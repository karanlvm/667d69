import React, { useEffect, useState } from "react";
import type { FormDefinition, Graph, GraphNode } from "./helpers/types";

export default function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/123/actions/blueprints/bp_456/bpv_123/graph")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Graph>;
      })
      .then(setGraph)
      .catch(console.error);
  }, []);

  if (!graph) return <p>Loading graph…</p>;

  const formNodes = graph.nodes.filter(n => n.type ==="form")
  const selectedFormDef : FormDefinition | undefined =
  selectedNode? graph.forms.find(f => f.id === selectedNode.data.component_id)
  : undefined ;


  return (
    <div style={{padding:20}}>
      <h1> Available Forms</h1>
      <ul>
        {formNodes.map(n => (
          <li key ={n.id}>
            <button onClick={() => setSelectedNode(n)}>
              {n.data.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedNode && selectedFormDef && (
        <div style={{marginTop: 20}}>
          <h2> Config for "{selectedNode.data.name}"</h2>

          <table border={1} cellPadding={5}>
            <thead>...</thead>
            <tbody>
              {Object.keys(selectedFormDef.field_schema.properties).map(field => (
                <tr key={field}>
                  <td>{field}</td>
                  <td>-- No mapping --</td>
                  <td><button>Configure</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
      )}




    </div>
  );
}

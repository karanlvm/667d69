/**
    Core interfaces for the dynamic form workflow
 
    GraphNode represents a form component in the flow
    GraphEdge links nodes to define the sequence
    FormDefinition describes the fields each form node uses
    Graph ties nodes, edges, and form definitions into one structure
 */
export interface GraphNode {
  id: string;
  type: "form";
  data: {
    component_id: string;
    name: string;
    input_mapping: Record<string, any>;
    // …
  };
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface FormDefinition {
  id: string;
  field_schema: {
    properties: Record<string, unknown>;
  };
  // …
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: FormDefinition[];
}

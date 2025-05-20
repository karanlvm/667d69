// src/types.ts

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: FormDefinition[];
  branches: any[];
  triggers: any[];
}

export interface GraphNode {
  id: string;
  type: string; // "form"
  position: { x: number; y: number };
  data: {
    id: string;
    component_key: string;
    component_type: string;
    component_id: string;   // matches FormDefinition.id
    name: string;           // e.g. "Form A"
    prerequisites: string[];
    input_mapping: Record<
      string,
      { sourceFormId: string; sourceField: string }
    >;
  };
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  field_schema: { properties: Record<string, any> };
  ui_schema: any;
  dynamic_field_config: any;
}

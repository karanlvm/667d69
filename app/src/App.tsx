import React, { useEffect, useState } from "react";
import "./App.css";
import type { GraphNode, FormDefinition, Graph } from "./helpers/types";
import { getUpstreamNodeIds } from "./helpers/utils";
import { useGraph } from "./hooks/useGraph";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { FormCard } from "./components/FormCard";
import { PrefillModal, Option, GLOBAL_VALUES } from "./components/PrefillModal";
import { Footer } from "./components/Footer";

const GRAPH_URL =
  "http://localhost:3000/api/v1/123/actions/blueprints/bp_456/bpv_123/graph";

export default function App() {
  const { graph, error } = useGraph(GRAPH_URL);

  // UI State
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [fieldToConfigure, setFieldToConfigure] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Prefill State
  const [prefillEnabled, setPrefillEnabled] = useState<Record<string, boolean>>(
    {}
  );
  const [formValues, setFormValues] = useState<
    Record<string, Record<string, any>>
  >({});
  const [mappings, setMappings] = useState<
    Record<string, Record<string, { sourceFormId: string; sourceField: string }>>
  >({});

  // Get and sort forms alphabetically
  const formNodes = (graph?.nodes.filter((n) => n.type === "form") ?? []).sort(
    (a, b) => a.data.name.localeCompare(b.data.name)
  );

  // Pick first form on graph load
  useEffect(() => {
    if (graph && !selectedFormId && formNodes.length > 0) {
      setSelectedFormId(formNodes[0].id);
    }
  }, [graph, formNodes, selectedFormId]);

  // Error handing :)
  if (error) return <div className="error">Error: {error}</div>;
  if (!graph) return <div className="loading">Loading…</div>;
  if (!selectedFormId) return null;

  // Current form & its definition
  const currentNode = formNodes.find((n) => n.id === selectedFormId)!;
  const currentDef = graph.forms.find(
    (f) => f.id === currentNode.data.component_id
  )! as FormDefinition;

  // upstream DAG
  const upstreamIds = getUpstreamNodeIds(currentNode.id, graph.edges);
  const upstreamNodes = formNodes.filter((n) => upstreamIds.includes(n.id));

  // Label map for sources
  const upstreamLabels: Record<string, string> = {
    GLOBAL: "Global values",
    ...Object.fromEntries(upstreamNodes.map((n) => [n.id, n.data.name])),
  };

  // Handlers
  function setNodeMapping(
    nodeId: string,
    newMap: Record<string, { sourceFormId: string; sourceField: string }>
  ) {
    setMappings((p) => ({ ...p, [nodeId]: newMap }));
  }

  function onTogglePrefill(nodeId: string, checked: boolean) {
    setPrefillEnabled((p) => ({ ...p, [nodeId]: checked }));
    if (!checked) {
      setNodeMapping(nodeId, {});
      return;
    }

    const newMap: Record<string, any> = {};
    const newVals: Record<string, any> = {};

    // first try GLOBAL, then each upstream form
    const sources = ["GLOBAL", ...upstreamNodes.map((n) => n.id)];

    Object.keys(currentDef.field_schema.properties).forEach((field) => {
      for (const sid of sources) {
        const v =
          sid === "GLOBAL"
            ? GLOBAL_VALUES[field]
            : formValues[sid]?.[field];
        if (v !== undefined) {
          newMap[field] = { sourceFormId: sid, sourceField: field };
          newVals[field] = v;
          break;
        }
      }
    });

    setNodeMapping(nodeId, newMap);
    setFormValues((p) => ({
      ...p,
      [nodeId]: { ...(p[nodeId] || {}), ...newVals },
    }));
  }

  function updateMapping(field: string, opt: Option) {
    const nm = { ...(mappings[currentNode.id] || {}) };
    nm[field] = { sourceFormId: opt.sourceFormId, sourceField: opt.sourceField };
    setNodeMapping(currentNode.id, nm);
  }

  function clearMapping(field: string) {
    const nm = { ...(mappings[currentNode.id] || {}) };
    delete nm[field];
    setNodeMapping(currentNode.id, nm);
    setFormValues((prev) => ({
      ...prev,
      [currentNode.id]: { ...(prev[currentNode.id] || {}), [field]: "" },
    }));
  }

  function getInputValue(field: string) {
    const map = mappings[currentNode.id]?.[field];
    if (map) {
      return map.sourceFormId === "GLOBAL"
        ? GLOBAL_VALUES[map.sourceField] ?? ""
        : formValues[map.sourceFormId]?.[map.sourceField] ?? "";
    }
    return formValues[currentNode.id]?.[field] ?? "";
  }

  function onFieldChange(field: string, value: any) {
    setFormValues((prev) => ({
      ...prev,
      [currentNode.id]: { ...(prev[currentNode.id] || {}), [field]: value },
    }));
  }

  // Next form in DAG
  const children = graph.edges
    .filter((e) => e.source === currentNode.id)
    .map((e) => e.target);
  function handleNext() {
    if (children.length) setSelectedFormId(children[0]);
  }

  // first global, then upstream fields for Prefill Modal
  const modalOptions: Option[] = [
    // global vals:
    ...Object.keys(GLOBAL_VALUES).map((field) => ({
      key: `GLOBAL.${field}`,
      label: `Global values.${field}`,
      sourceFormId: "GLOBAL",
      sourceField: field,
    })),
    // upstream vals:
    ...upstreamNodes.flatMap((n) => {
      const def = graph.forms.find((f) => f.id === n.data.component_id)!;
      return Object.keys(def.field_schema.properties).map((fn) => ({
        key: `${n.id}.${fn}`,
        label: `${n.data.name}.${fn}`,
        sourceFormId: n.id,
        sourceField: fn,
      }));
    }),
  ];

  return (
    <div className="app">
      <Header />

      <div className="content">
        <Sidebar
          forms={formNodes}
          activeId={currentNode.id}
          onSelect={setSelectedFormId}
          open={drawerOpen}
          toggle={() => setDrawerOpen((o) => !o)}
        />

        <main className="main-panel">
          <FormCard
            node={currentNode}
            definition={currentDef}
            values={formValues[currentNode.id] || {}}
            mappings={mappings[currentNode.id] || {}}
            upstreamLabels={upstreamLabels}
            prefillEnabled={!!prefillEnabled[currentNode.id]}
            onTogglePrefill={(c) => onTogglePrefill(currentNode.id, c)}
            onFieldChange={onFieldChange}
            onClear={clearMapping}
            onConfigure={setFieldToConfigure}
            nextDisabled={children.length === 0}
            onNext={handleNext}
          />

          <PrefillModal
            fieldName={fieldToConfigure || ""}
            isOpen={Boolean(fieldToConfigure)}
            options={modalOptions}
            onSelect={(opt) => {
              updateMapping(fieldToConfigure!, opt);
              setFieldToConfigure(null);
            }}
            onClose={() => setFieldToConfigure(null)}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}

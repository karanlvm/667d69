
/*
  This component is to render the forms

*/
import { motion } from "framer-motion";
import type { FormDefinition, GraphNode } from "../helpers/types";
import { FieldRow } from "./FieldRow";

interface FormCardProps {
  node: GraphNode;
  definition: FormDefinition;
  values: Record<string, any>;
  mappings: Record<string, { sourceFormId: string; sourceField: string }>;
  upstreamLabels: Record<string,string>;
  prefillEnabled: boolean;
  onTogglePrefill: (checked: boolean) => void;
  onFieldChange: (field: string, v: any) => void;
  onClear: (field: string) => void;
  onConfigure: (field: string) => void;
  nextDisabled: boolean;
  onNext: () => void;
}

export function FormCard({
  node, definition, values, mappings, upstreamLabels,
  prefillEnabled, onTogglePrefill, onFieldChange,
  onClear, onConfigure, nextDisabled, onNext,
}: FormCardProps) {
  return (
    <motion.div
      key={node.id}
      className="form-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-header">
        <h2>{node.data.name}</h2>
        <label>
          <input
            type="checkbox"
            checked={prefillEnabled}
            onChange={e => onTogglePrefill(e.target.checked)}
          />
          <span>Prefill</span>
        </label>
      </div>

      <div className="fields">
        {Object.keys(definition.field_schema.properties).map((field) => {
          const map = mappings[field];
          const isPrefilled = Boolean(map && prefillEnabled);
          const sourceLabel = map
            ? `${upstreamLabels[map.sourceFormId]}.${map.sourceField}`
            : "";

          return (
            <FieldRow
              key={field}
              field={field}
              value={values[field] ?? ""}
              isPrefilled={isPrefilled}
              sourceLabel={sourceLabel}
              onClear={() => onClear(field)}
              onConfigure={() => onConfigure(field)}
              onChange={(v) => onFieldChange(field, v)}
            />
          );
        })}
      </div>

      <button
        className="next-btn"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextDisabled ? "Submit" : "Next"}
      </button>
    </motion.div>
  );
}

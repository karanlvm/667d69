import React from "react";
import type { Option } from "./PrefillModal";

interface FieldRowProps {
  field: string;
  value: any;
  isPrefilled: boolean;
  sourceLabel?: string;
  onClear: () => void;
  onConfigure: () => void;
  onChange: (v: any) => void;
}

export function FieldRow({
  field,
  value,
  isPrefilled,
  sourceLabel,
  onClear,
  onConfigure,
  onChange,
}: FieldRowProps) {
  return (
    <div className="field-row">
      <label>{field}</label>
      <div className="field-input-wrapper">
        <input
          type="text"
          value={value}
          readOnly={isPrefilled}
          onClick={isPrefilled ? onConfigure : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPrefilled && (
          <button className="clear-btn" onClick={onClear}>×</button>
        )}
      </div>
      <div className="field-info">
        {isPrefilled
          ? <>from <button className="link-btn" onClick={onConfigure}>{sourceLabel}</button></>
          : <em>{/* either “click to configure” or “prefill disabled” */}</em>}
      </div>
    </div>
  );
}

/**
  Searchable list of global and upstream form fields
 */

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/PrefillModal.css";

export interface Option {
  key: string;             // unique key, eg "GLOBAL.email" 
  label: string;           // display name, e.g. "Global values.email"
  sourceFormId: string;    // "GLOBAL" or a specific form node ID
  sourceField: string;     // field name, e.g. "email"
}

interface PrefillModalProps {
  fieldName: string;           // name of the field being configured
  isOpen: boolean;             // whether modal is visible
  options: Option[];           // upstream form options passed in
  onSelect: (opt: Option) => void;
  onClose: () => void;
}

// Global values that will be available in all the forms
export const GLOBAL_VALUES: Record<string, any> = {
  button: false,
  dynamic_checkbox_group: ["one", "two"],
  dynamic_object: "This is an object",
  email: "karanlvm123@gmail.com",
  id: "mydogranovermykeyboard",
  multi_select: ["random"],
  name: "Karan",
  notes: "Oh look, Global Prefill works :)",
};

export function PrefillModal({
  fieldName,
  isOpen,
  options,
  onSelect,
  onClose,
}: PrefillModalProps) {
  const [search, setSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // clear local state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedKey(null);
      setExpanded(new Set());
    }
  }, [isOpen]);

  // convert global defaults into Option objects
  const globalOptions: Option[] = useMemo(
    () =>
      Object.keys(GLOBAL_VALUES).map((field) => ({
        key: `GLOBAL.${field}`,
        label: `Global values.${field}`,
        sourceFormId: "GLOBAL",
        sourceField: field,
      })),
    []
  );

  // combine global and passed-in upstream options
const allOptions = useMemo(() => {
  const combined = [...globalOptions, ...options];
  const seen = new Set<string>();
  return combined.filter((opt) => {
    if (seen.has(opt.key)) return false;
    seen.add(opt.key);
    return true;
  });
}, [globalOptions, options]);
  // group options by the text before the first dot in their label
  const grouped = useMemo(() => {
    const map: Record<string, Option[]> = {};
    allOptions.forEach((opt) => {
      const [group] = opt.label.split(".");
      (map[group] ||= []).push(opt);
    });
    return map;
  }, [allOptions]);

  // filter by search term and ensure "Global values" appears first
  const groupEntries: [string, Option[]][] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const entries = Object.entries(grouped)
      .map(([grp, opts]) => [
        grp,
        q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts,
      ] as [string, Option[]])
      .filter(([, opts]) => opts.length > 0);

    entries.sort((a, b) => {
      if (a[0] === "Global values") return -1;
      if (b[0] === "Global values") return 1;
      return a[0].localeCompare(b[0]);
    });
    return entries;
  }, [grouped, search]);

  // toggle whether a group is expanded or collapsed
  const toggle = (grp: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(grp) ? next.delete(grp) : next.add(grp);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="prefill-modal-overlay">
      <div className="prefill-modal-container">
        {/* Header */}
        <div className="prefill-modal-header">
          <h3>Configure “{fieldName}”</h3>
        </div>

        {/* Body: sidebar list + detail pane */}
        <div className="prefill-modal-body">
          <div className="prefill-modal-sidebar">
            <div className="prefill-modal-search">
              <input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="prefill-modal-list">
              <ul>
                {groupEntries.map(([grp, opts]) => (
                  <li key={grp}>
                    <div
                      className="prefill-modal-group-label"
                      onClick={() => toggle(grp)}
                    >
                      <motion.span animate={{ rotate: expanded.has(grp) ? 90 : 0 }}>
                        ▶
                      </motion.span>
                      {grp}
                    </div>
                    <AnimatePresence initial={false}>
                      {expanded.has(grp) && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {opts.map((opt) => {
                            const isSel = opt.key === selectedKey;
                            const [, fieldLabel] = opt.label.split(".");
                            return (
                              <motion.li key={opt.key} whileHover={{ scale: 1.02 }}>
                                <div
                                  className={`prefill-modal-option ${isSel ? "selected" : ""}`}
                                  onClick={() => setSelectedKey(opt.key)}
                                >
                                  {fieldLabel}
                                </div>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="prefill-modal-detail" />
        </div>
        <div className="prefill-modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              const sel = allOptions.find((o) => o.key === selectedKey);
              sel && onSelect(sel);
            }}
            disabled={!selectedKey}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

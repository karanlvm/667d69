import { motion, LayoutGroup } from "framer-motion";
import type { GraphNode } from "../helpers/types";
import "../styles/Sidebar.css";

interface SidebarProps {
  forms: GraphNode[];
  activeId: string;
  onSelect: (id: string) => void;
  open: boolean;
  toggle: () => void;
}

export function Sidebar({
  forms,
  activeId,
  onSelect,
  open,
  toggle,
}: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: open ? 200 : 32,
        paddingLeft: open ? 16 : 4,
        paddingRight: open ? 16 : 4,
      }}
      transition={{ duration: 0.2 }}
      className="sidebar"
    >
      <motion.button
        className="toggle-btn"
        onClick={toggle}
        initial={false}
        animate={{ rotate: open ? 0 : 180 }}
      >
        «
      </motion.button>

      {open && (
        <LayoutGroup>
          <ul className="form-list">
            {forms.map((n) => {
              const isActive = n.id === activeId;
              return (
                <li key={n.id} className="form-list-item">
                  {isActive && (
                    <motion.div
                      className="sidebar-highlight"
                      layoutId="sidebar-highlight"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  <button
                    className={`form-btn${isActive ? " active" : ""}`}
                    onClick={() => onSelect(n.id)}
                    style={{
                      position: "relative",
                      zIndex: 1,         // This worked and I think it's cause the clicks were being intercepted before?
                    }}
                  >
                    {n.data.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>
      )}
    </motion.aside>
  );
}

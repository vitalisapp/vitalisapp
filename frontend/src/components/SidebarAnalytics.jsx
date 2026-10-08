import { useEffect, useState } from "react";
import Sidebar from "./Sidebar.jsx";

// Alias over Sidebar with self-owned expand state.
export default function SidebarAnalytics({ onExpandChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  return <Sidebar expanded={isExpanded} setExpanded={setIsExpanded} />;
}

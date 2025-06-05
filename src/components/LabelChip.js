// expense-tracker-frontend/src/components/LabelChip.js
import React from "react";

export default function LabelChip({ label }) {
  // label = { name: "...", color: "#XXXXX" }
  const style = {
    backgroundColor: label.color,
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.9rem",
    textTransform: "capitalize",
    display: "inline-block",
  };

  return <span style={style}>{label.name}</span>;
}

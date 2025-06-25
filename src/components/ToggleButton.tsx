import React, { useState } from "react";

export default function ToggleButton() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <button
      className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-2 py-1 rounded-r shadow"
      onClick={() => setCollapsed((prev) => !prev)}
    >
      {collapsed ? ">" : "<"}
    </button>
  );
}

// expense-tracker-frontend/src/components/LabelForm.js
import React, { useState } from "react";
import axios from "axios";

export default function LabelForm({ apiBaseUrl, authHeader, onLabelAdded }) {
  const [name, setName]   = useState("");
  const [color, setColor] = useState("#000000");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Label name is required.");
      return;
    }

    try {
      await axios.post(
        `${apiBaseUrl}/labels`,
        { name, color },
        { headers: { Authorization: authHeader } }
      );
      // Re-fetch labels
      const res = await axios.get(`${apiBaseUrl}/labels`);
      onLabelAdded(res.data);
      setName("");
      setColor("#000000");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add label.");
    }
  };

  return (
    <div>
      <h3>Add New Label</h3>
      <form id="label-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Label name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button type="submit">Add Label</button>
        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      </form>
      <div style={{ marginTop: "8px" }}>
        Preview:{" "}
        <span className="label-preview" style={{ backgroundColor: color }}></span>{" "}
        {name || "(no name yet)"}
      </div>
    </div>
  );
}

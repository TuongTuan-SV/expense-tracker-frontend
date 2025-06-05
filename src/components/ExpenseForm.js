// expense-tracker-frontend/src/components/ExpenseForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ExpenseForm({
  apiBaseUrl,
  labels,
  authHeader,
  onExpensesAdded,
}) {
  const [rows, setRows]       = useState([
    { item: "", amount: "", labelId: labels.length ? labels[0]._id : "" },
  ]);
  const [error, setError]     = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Ensure each row has a valid labelId if labels change
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        labelId: labels.length ? r.labelId || labels[0]._id : "",
      }))
    );
  }, [labels]);

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { item: "", amount: "", labelId: labels.length ? labels[0]._id : "" },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Build payload & validate
    const payload = [];
    for (let [i, row] of rows.entries()) {
      if (!row.item.trim()) {
        setError(`Row ${i + 1}: item is required.`);
        return;
      }
      const amt = parseInt(row.amount, 10);
      if (isNaN(amt) || amt < 0) {
        setError(`Row ${i + 1}: amount must be a non-negative integer (VND).`);
        return;
      }
      if (!row.labelId) {
        setError(`Row ${i + 1}: please select a label.`);
        return;
      }
      payload.push({
        item:   row.item.trim(),
        amount: amt,
        labelId: row.labelId,
      });
    }

    setSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/expenses`, payload, {
        headers: { Authorization: authHeader },
      });
      // Re-fetch current month’s expenses
      const now = new Date();
      const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const res = await axios.get(`${apiBaseUrl}/expenses`, {
        params: { month: curMonth },
      });
      onExpensesAdded(res.data);
      // Reset form to one blank row
      setRows([{ item: "", amount: "", labelId: labels[0]._id }]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit expenses.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-section">
      <h3>Add Expenses</h3>
      <form onSubmit={handleSubmit}>
        {rows.map((row, idx) => {
          const isLast = idx === rows.length - 1;
          return (
            <div key={idx} className="expense-row">
              <input
                type="text"
                placeholder="Item"
                value={row.item}
                onChange={(e) => handleRowChange(idx, "item", e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount (VND)"
                min="0"
                step="1"
                value={row.amount}
                onChange={(e) => handleRowChange(idx, "amount", e.target.value)}
              />
              <select
                value={row.labelId}
                onChange={(e) => handleRowChange(idx, "labelId", e.target.value)}
              >
                {labels.map((lbl) => (
                  <option key={lbl._id} value={lbl._id}>
                    {lbl.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                disabled={rows.length === 1}
                className="small-btn"
              >
                –
              </button>
              {isLast && (
                <>
                  <button
                    type="button"
                    onClick={addRow}
                    className="small-btn"
                  >
                    +
                  </button>
                  <button
                    id="expense-submit-btn"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </button>
                </>
              )}
            </div>
          );
        })}
        {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
      </form>
    </div>
  );
}

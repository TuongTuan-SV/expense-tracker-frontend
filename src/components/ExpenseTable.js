// expense-tracker-frontend/src/components/ExpenseTable.js
import React, { useState } from "react";
import axios from "axios";
import LabelChip from "./LabelChip";

export default function ExpenseTable({
  expenses,
  apiBaseUrl,
  authHeader,
  labels,
  onExpenseUpdated,
  onExpenseDeleted,
}) {
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({
    item: "",
    amount: "",
    labelId: "",
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (expense) => {
    setEditId(expense._id);
    setEditValues({
      item: expense.item,
      amount: expense.amount,
      labelId: expense.labelId._id,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setError(null);
  };

  const handleEditChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    const { item, amount, labelId } = editValues;
    if (!item.trim()) {
      setError("Item cannot be empty.");
      return;
    }
    const amtNum = parseInt(amount, 10);
    if (isNaN(amtNum) || amtNum < 0) {
      setError("Amount must be a non-negative number.");
      return;
    }
    if (!labelId) {
      setError("Please select a label.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await axios.put(
        `${apiBaseUrl}/expenses/${editId}`,
        {
          item: item.trim(),
          amount: amtNum,
          labelId,
        },
        {
          headers: { Authorization: authHeader },
        }
      );
      onExpenseUpdated(res.data);
      setEditId(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this expense?");
    if (!ok) return;

    try {
      await axios.delete(`${apiBaseUrl}/expenses/${id}`, {
        headers: { Authorization: authHeader },
      });
      onExpenseDeleted(id);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete expense.");
    }
  };

  if (!expenses.length) {
    return <p>No expenses recorded for this month.</p>;
  }

  return (
    <div>
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th className="amount-cell">Amount (VND)</th>
            <th>Label</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => {
            const isEditing = editId === e._id;
            const createdDate = new Date(e.createdAt).toLocaleDateString("vi-VN");

            return (
              <tr key={e._id}>
                <td style={{ minWidth: "75px" }}>{createdDate}</td>
                <td style={{ minWidth: "120px" }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValues.item}
                      onChange={(ev) => handleEditChange("item", ev.target.value)}
                    />
                  ) : (
                    e.item
                  )}
                </td>
                <td className="amount-cell" style={{ minWidth: "100px" }}>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editValues.amount}
                      onChange={(ev) =>
                        handleEditChange("amount", ev.target.value)
                      }
                    />
                  ) : (
                    Number(e.amount)
                      .toLocaleString("vi-VN", { maximumFractionDigits: 0 })
                      .replace(/\s/g, ".") + " ₫"
                  )}
                </td>
                <td style={{ minWidth: "100px" }}>
                  {isEditing ? (
                    <select
                      value={editValues.labelId}
                      onChange={(ev) =>
                        handleEditChange("labelId", ev.target.value)
                      }
                    >
                      {labels.map((lbl) => (
                        <option key={lbl._id} value={lbl._id}>
                          {lbl.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <LabelChip label={e.labelId} />
                  )}
                </td>
                <td style={{ minWidth: "160px" }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        style={{ marginRight: "8px" }}
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(e)}
                        style={{ marginRight: "8px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e._id)}
                        style={{ backgroundColor: "#dc3545", color: "white" }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
    </div>
  );
}

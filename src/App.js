// expense-tracker-frontend/src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

import LoginModal from "./components/LoginModal";
import LabelForm from "./components/LabelForm";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import { exportExpensesToExcel } from "./utils/excelExport";

function App() {
  const apiBaseUrl = "https://family-expense-api.onrender.com";

  // Authentication (sessionStorage)
  const existingAuth = sessionStorage.getItem("authHeader") || "";
  const [authHeader, setAuthHeader] = useState(existingAuth);
  const [isLoggedIn, setIsLoggedIn] = useState(!!existingAuth);

  // Labels & Expenses state
  const [labels, setLabels] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Month picker ("YYYY-MM")
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, "0");
  const [month, setMonth] = useState(`${yyyy}-${mm}`);

  // Fetch labels
  const fetchLabels = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/labels`);
      setLabels(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch labels.");
    }
  };

  // Fetch expenses for a given month
  const fetchExpenses = async (targetMonth) => {
    try {
      const res = await axios.get(`${apiBaseUrl}/expenses`, {
        params: { month: targetMonth },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch expenses.");
    }
  };

  // On mount (if logged in), load data
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      Promise.all([fetchLabels(), fetchExpenses(month)]).finally(() =>
        setLoading(false)
      );
    }
    // eslint-disable-next-line
  }, [isLoggedIn]);

  // Re-fetch when month changes
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      fetchExpenses(month).finally(() => setLoading(false));
    }
  }, [month, isLoggedIn]);

  // Login success handler
  const handleLoginSuccess = (headerValue) => {
    sessionStorage.setItem("authHeader", headerValue);
    setAuthHeader(headerValue);
    setIsLoggedIn(true);
  };

  // After adding a new label
  const handleLabelAdded = (newLabelList) => {
    setLabels(newLabelList);
  };

  // After adding new expenses
  const handleExpensesAdded = (newExpensesList) => {
    setExpenses(newExpensesList);
  };

  // After editing an expense
  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((e) => (e._id === updatedExpense._id ? updatedExpense : e))
    );
  };

  // After deleting an expense
  const handleExpenseDeleted = (deletedId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== deletedId));
  };

  // If not logged in, show LoginModal
  if (!isLoggedIn) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  // Loading / error
  if (loading) {
    return <p>Loading…</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="container">
      {/* Month Picker */}
      <div id="month-picker-container">
        <label htmlFor="month-picker-input">Select month:</label>
        <input
          type="month"
          id="month-picker-input"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      <h1>Family Expense Tracker ({month})</h1>

      {/* Add New Label */}
      <div className="form-section">
        <LabelForm
          apiBaseUrl={apiBaseUrl}
          authHeader={authHeader}
          onLabelAdded={handleLabelAdded}
        />
      </div>

      {/* Add Expenses */}
      <div className="form-section">
        <ExpenseForm
          apiBaseUrl={apiBaseUrl}
          labels={labels}
          authHeader={authHeader}
          onExpensesAdded={handleExpensesAdded}
        />
      </div>

      {/* Expense Table */}
      <h3>Expenses for {month}</h3>
      <div className="table-container">
        <ExpenseTable
          expenses={expenses}
          apiBaseUrl={apiBaseUrl}
          authHeader={authHeader}
          labels={labels}
          onExpenseUpdated={handleExpenseUpdated}
          onExpenseDeleted={handleExpenseDeleted}
        />
      </div>

      {/* Export to Excel */}
      <button onClick={() => exportExpensesToExcel(expenses, month)}>
        Export to Excel
      </button>
    </div>
  );
}

export default App;

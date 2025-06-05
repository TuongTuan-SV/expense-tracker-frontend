// expense-tracker-frontend/src/utils/excelExport.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * @param {Array} expenses
 *   [
 *     {
 *       _id,
 *       item,
 *       amount,        // integer VND
 *       createdAt,     // ISO string
 *       labelId: { name, color, _id },
 *     },
 *     ...
 *   ]
 * @param {String} month // in "YYYY-MM" format
 */
export function exportExpensesToExcel(expenses, month) {
  const header = ["Item", "Amount (VND)", "Label", "Date"];
  const dataRows = expenses.map((e) => [
    e.item,
    Number(e.amount).toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
    e.labelId.name,
    new Date(e.createdAt).toLocaleString("vi-VN"),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob  = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, `expenses_${month}_VND.xlsx`);
}

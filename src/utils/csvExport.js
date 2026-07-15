/**
 * Exports data rows to a CSV file.
 * 
 * @param {Array<string>} headers - Column headers
 * @param {Array<Array<any>>} rows - Row data values
 * @param {string} filename - The name of the downloaded file
 */
export function exportToCSV(headers, rows, filename = "export.csv") {
  const escapeField = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeField).join(",");
  const dataRows = rows.map(row => row.map(escapeField).join(",")).join("\n");
  const csvContent = `${headerRow}\n${dataRows}`;

  // Prepend BOM character (\uFEFF) for Excel Hebrew support
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function getFileNameFromContentDispositionHeader(
  header: string | null,
): string {
  if (!header) {
    return "downloaded_file"; // Default filename if header is missing
  }

  const fileNameMatch = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
  if (!fileNameMatch || fileNameMatch.length < 2) {
    throw new Error("Filename not found in Content-Disposition header.");
  }

  return fileNameMatch[1].replace(/['"]/g, "");
}

export async function downloadDocumentFile(file: Blob, fileName: string) {
  const blob = new Blob([file], { type: file.type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exports data as a CSV file and triggers a download in the browser.
 *
 * @param header - The CSV header row containing column names separated by commas.
 *                 Example: "Timestamp,Action,Resource Type,Resource ID\n"
 * @param body - An array of data rows to be included in the CSV body.
 *               Each row should be a formatted string with comma-separated values.
 *               Example: ["2024-01-15,CREATE,Document,doc-123", "2024-01-15,UPDATE,Document,doc-456"]
 * @param fileName - The name of the CSV file to be downloaded. Defaults to "export.csv" if not provided.
 *
 * @example
 * ```
 * const header = "Timestamp,Action,Resource Type,Resource ID\n";
 * const body = logs
 *   .map((log) => `${log.timestamp},${log.action},${log.resourceType},${log.resourceId}`)
 *   .join("\n");
 * exportCsv(header, body, "export.csv");
 * ```
 */
export function exportToCSV(
  header: string,
  body: string,
  fileName: string = "export.csv",
) {
  const csvContent = header + body;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

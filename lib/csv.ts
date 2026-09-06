import type { PlanningMethod } from "@/lib/types";

export interface CsvProductDraft {
  name: string;
  category: string;
  subcategory: string;
  stock: number;
  sellingPrice: number;
  costPrice: number;
  planningMethod: PlanningMethod;
  lowStockThreshold: number;
}

const splitCsvLine = (line: string) => {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted;
    } else if (character === "," && !quoted) { cells.push(cell.trim()); cell = ""; } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
};

export function parseProductsCsv(text: string): CsvProductDraft[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/\s+/g, ""));
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return {
      name: row.name || "Untitled product",
      category: row.category || "General",
      subcategory: row.subcategory || "Other",
      stock: Number(row.stock) || 0,
      sellingPrice: Number(row.sellingprice) || 0,
      costPrice: Number(row.costprice) || 0,
      planningMethod: row.planningmethod === "VMI" ? "VMI" : "FORECAST_AI",
      lowStockThreshold: Number(row.lowstockthreshold) || 5,
    };
  });
}

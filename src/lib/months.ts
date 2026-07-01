export interface MonthOption {
  key: string; 
  label: string; 
  labelKa: string;
}

export const MONTHS: readonly MonthOption[] = [
  { key: "2026-04-01", label: "April 2026", labelKa: "აპრილი 2026" },
  { key: "2026-05-01", label: "May 2026", labelKa: "მაისი 2026" },
  { key: "2026-06-01", label: "June 2026", labelKa: "ივნისი 2026" },
] as const;

export const DEFAULT_MONTH = MONTHS[2].key; 

export function monthRange(monthKey: string): { start: string; end: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

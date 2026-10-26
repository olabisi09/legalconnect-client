/**
 * Page numbers to render (0-based), collapsing long runs into "ellipsis".
 * Always shows the first and last page plus `siblings` either side of the current one.
 */
export function getPaginationRange(
  pageIndex: number,
  pageCount: number,
  siblings = 1,
): (number | "ellipsis")[] {
  const totalSlots = siblings * 2 + 5;
  if (pageCount <= totalSlots) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const start = Math.max(pageIndex - siblings, 1);
  const end = Math.min(pageIndex + siblings, pageCount - 2);
  const range: (number | "ellipsis")[] = [0];

  if (start > 1) range.push("ellipsis");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < pageCount - 2) range.push("ellipsis");

  range.push(pageCount - 1);
  return range;
}

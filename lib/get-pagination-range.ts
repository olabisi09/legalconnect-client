// lib/get-pagination-range.ts
const ELLIPSIS = "ellipsis" as const;

export function getPaginationRange(
  pageIndex: number,
  pageCount: number,
  siblingCount = 1,
): (number | typeof ELLIPSIS)[] {
  const totalPageNumbers = siblingCount * 2 + 5; // first + last + current + 2 siblings + 2 ellipses

  if (pageCount <= totalPageNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  const leftSiblingIndex = Math.max(pageIndex - siblingCount, 0);
  const rightSiblingIndex = Math.min(pageIndex + siblingCount, pageCount - 1);

  const showLeftEllipsis = leftSiblingIndex > 1;
  const showRightEllipsis = rightSiblingIndex < pageCount - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;
    return [
      ...Array.from({ length: leftItemCount }, (_, i) => i),
      ELLIPSIS,
      pageCount - 1,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    return [
      0,
      ELLIPSIS,
      ...Array.from(
        { length: rightItemCount },
        (_, i) => pageCount - rightItemCount + i,
      ),
    ];
  }

  return [
    0,
    ELLIPSIS,
    ...Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    ),
    ELLIPSIS,
    pageCount - 1,
  ];
}

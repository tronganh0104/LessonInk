export type PageRangeParseResult =
  | {
      ok: true;
      pages: number[];
    }
  | {
      ok: false;
      error: string;
    };

function parsePositiveInteger(value: string): number | undefined {
  if (!/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parsePageRange(input: string, totalPages: number): PageRangeParseResult {
  const trimmedInput = input.trim();

  if (!Number.isSafeInteger(totalPages) || totalPages < 1) {
    return { ok: false, error: "This PDF does not contain any pages." };
  }

  if (!trimmedInput) {
    return { ok: false, error: "Enter at least one page number or range." };
  }

  if (!/^[\d,\-\s]+$/.test(trimmedInput)) {
    return { ok: false, error: "Use only page numbers, commas, and hyphens." };
  }

  const pages = new Set<number>();
  const segments = trimmedInput.split(",");

  for (const rawSegment of segments) {
    const segment = rawSegment.trim();

    if (!segment) {
      return { ok: false, error: "Remove empty page range entries." };
    }

    const rangeMatch = segment.match(/^(\d+)\s*-\s*(\d+)$/);

    if (rangeMatch) {
      const start = parsePositiveInteger(rangeMatch[1]);
      const end = parsePositiveInteger(rangeMatch[2]);

      if (!start || !end) {
        return { ok: false, error: "Page numbers must be positive integers." };
      }

      if (start > end) {
        return { ok: false, error: "Page ranges must start before they end." };
      }

      if (end > totalPages) {
        return { ok: false, error: `Page numbers cannot exceed ${totalPages}.` };
      }

      for (let page = start; page <= end; page += 1) {
        pages.add(page);
      }

      continue;
    }

    const pageNumber = parsePositiveInteger(segment);

    if (!pageNumber) {
      return { ok: false, error: "Page numbers must be positive integers." };
    }

    if (pageNumber > totalPages) {
      return { ok: false, error: `Page numbers cannot exceed ${totalPages}.` };
    }

    pages.add(pageNumber);
  }

  return {
    ok: true,
    pages: [...pages].sort((first, second) => first - second)
  };
}

import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { BoardPage, PdfPageDocument } from "../../board/board.types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface ImportPdfAsPagesInput {
  file: File;
  pageNumbers?: number[];
}

const now = () => new Date().toISOString();

function createPdfPageDocument(
  pageId: string,
  pageNumber: number,
  source: string,
  width: number,
  height: number
): PdfPageDocument {
  const timestamp = now();

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "pdfPage",
    sourceType: "embeddedRender",
    source,
    pdfPageNumber: pageNumber,
    x: 0,
    y: 0,
    width,
    height,
    rotation: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function createPdfBoardPage(pageNumber: number, source: string, width: number, height: number): BoardPage {
  const timestamp = now();
  const pageId = crypto.randomUUID();

  return {
    id: pageId,
    title: `PDF Page ${pageNumber}`,
    index: pageNumber - 1,
    background: {
      type: "pdf",
      color: "#ffffff"
    },
    document: createPdfPageDocument(pageId, pageNumber, source, width, height),
    objects: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function validatePdfFile(file: File): void {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF file.");
  }
}

export interface PdfImportMetadata {
  fileName: string;
  totalPages: number;
}

export async function readPdfImportMetadata(file: File): Promise<PdfImportMetadata> {
  validatePdfFile(file);

  try {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    return {
      fileName: file.name,
      totalPages: pdf.numPages
    };
  } catch (error) {
    if (error instanceof Error && error.message !== "Invalid PDF structure.") {
      throw new Error(`Could not read PDF metadata. ${error.message}`);
    }

    throw new Error("Could not read PDF metadata. The selected file may be damaged or password protected.");
  }
}

function normalizeSelectedPages(pageNumbers: number[] | undefined, totalPages: number): number[] {
  if (!pageNumbers || pageNumbers.length === 0) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [...new Set(pageNumbers)].sort((first, second) => first - second);

  if (pages.some((pageNumber) => !Number.isSafeInteger(pageNumber) || pageNumber < 1 || pageNumber > totalPages)) {
    throw new Error(`Selected PDF pages must be between 1 and ${totalPages}.`);
  }

  return pages;
}

export async function importPdfAsBoardPages({ file, pageNumbers }: ImportPdfAsPagesInput): Promise<BoardPage[]> {
  validatePdfFile(file);

  try {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages: BoardPage[] = [];
    const selectedPages = normalizeSelectedPages(pageNumbers, pdf.numPages);

    for (const pageNumber of selectedPages) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("PDF rendering is not available in this browser.");
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;

      pages.push(createPdfBoardPage(pageNumber, canvas.toDataURL("image/png"), canvas.width, canvas.height));
    }

    if (pages.length === 0) {
      throw new Error("The selected PDF does not contain any pages.");
    }

    return pages;
  } catch (error) {
    if (error instanceof Error && error.message !== "Invalid PDF structure.") {
      throw new Error(`Could not import PDF. ${error.message}`);
    }

    throw new Error("Could not import PDF. The selected file may be damaged or password protected.");
  }
}

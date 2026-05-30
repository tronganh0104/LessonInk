import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { BoardPage, PdfPageDocument } from "../../board/board.types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface ImportPdfAsPagesInput {
  file: File;
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

export async function importPdfAsBoardPages({ file }: ImportPdfAsPagesInput): Promise<BoardPage[]> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please choose a PDF file.");
  }

  try {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pages: BoardPage[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
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

import { PDFDocument } from "pdf-lib";
import type { Board } from "../../board/board.types";
import { createPagePngDataUrl } from "./pngExporter";

interface ExportBoardToPdfInput {
  board: Board;
  width: number;
  height: number;
  fileName?: string;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const [, base64 = ""] = dataUrl.split(",");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function getDefaultPdfExportName(date = new Date()): string {
  return `mushroomlearning-lesson-${date.toISOString().slice(0, 10)}.pdf`;
}

export async function createBoardPdfBytes({ board, width, height }: ExportBoardToPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();

  for (const page of board.pages) {
    const dataUrl = await createPagePngDataUrl({ page, width, height });
    const png = await pdf.embedPng(dataUrlToBytes(dataUrl));
    const pdfPage = pdf.addPage([png.width, png.height]);

    pdfPage.drawImage(png, {
      x: 0,
      y: 0,
      width: png.width,
      height: png.height
    });
  }

  return pdf.save();
}

export async function exportBoardToPdf(input: ExportBoardToPdfInput): Promise<void> {
  const pdfBytes = await createBoardPdfBytes(input);
  const pdfBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = input.fileName ?? getDefaultPdfExportName();
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

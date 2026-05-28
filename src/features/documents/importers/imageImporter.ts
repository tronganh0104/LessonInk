import type { ImagePageDocument } from "../../board/board.types";

const supportedImageTypes = ["image/png", "image/jpeg"];

interface ImportImageDocumentInput {
  file: File;
  pageId: string;
  viewportWidth: number;
  viewportHeight: number;
}

function isSupportedImageType(type: string): type is ImagePageDocument["mimeType"] {
  return supportedImageTypes.includes(type);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Could not read the selected image as a data URL."));
        return;
      }

      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function getImageSize(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.onload = () =>
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      });
    image.src = source;
  });
}

export async function importImageAsPageDocument({
  file,
  pageId,
  viewportWidth,
  viewportHeight
}: ImportImageDocumentInput): Promise<ImagePageDocument> {
  if (!isSupportedImageType(file.type)) {
    throw new Error("Please choose a PNG or JPG image.");
  }

  const source = await readFileAsDataUrl(file);
  const naturalSize = await getImageSize(source);
  const maxWidth = Math.max(320, viewportWidth - 96);
  const maxHeight = Math.max(240, viewportHeight - 96);
  const scale = Math.min(1, maxWidth / naturalSize.width, maxHeight / naturalSize.height);
  const width = Math.max(1, Math.round(naturalSize.width * scale));
  const height = Math.max(1, Math.round(naturalSize.height * scale));
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    pageId,
    kind: "image",
    sourceType: "embedded",
    source,
    mimeType: file.type,
    altText: file.name,
    x: Math.max(24, Math.round((viewportWidth - width) / 2)),
    y: Math.max(24, Math.round((viewportHeight - height) / 2)),
    width,
    height,
    rotation: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

import type { CanvasObject, TextObject } from "../canvas.types";

export function moveTextObject(text: TextObject, deltaX: number, deltaY: number): TextObject {
  return {
    ...text,
    x: text.x + deltaX,
    y: text.y + deltaY,
    updatedAt: new Date().toISOString()
  };
}

export function moveCanvasObject(object: CanvasObject, deltaX: number, deltaY: number): CanvasObject {
  if (object.kind === "text") {
    return moveTextObject(object, deltaX, deltaY);
  }

  return object;
}

export function moveObjectInList(objects: CanvasObject[], objectId: string, deltaX: number, deltaY: number): CanvasObject[] {
  return objects.map((object) => (object.id === objectId ? moveCanvasObject(object, deltaX, deltaY) : object));
}

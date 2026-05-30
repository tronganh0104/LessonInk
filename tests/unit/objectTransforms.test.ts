import { describe, expect, it } from "vitest";
import type { CanvasObject, StrokeObject, TextObject } from "../../src/features/canvas/canvas.types";
import { moveObjectInList, moveTextObject } from "../../src/features/canvas/objects/objectTransforms";

function createText(id: string, pageId = "page-1", x = 10, y = 20): TextObject {
  return {
    id,
    pageId,
    kind: "text",
    text: "Move me",
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 24,
    color: "#111827",
    width: 160,
    height: 34,
    x,
    y,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

function createStroke(id: string): StrokeObject {
  return {
    id,
    pageId: "page-1",
    kind: "stroke",
    type: "stroke",
    tool: "pen",
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 10 }
    ],
    color: "#111827",
    opacity: 1,
    width: 4,
    x: 0,
    y: 0,
    rotation: 0,
    locked: false,
    createdAt: "2026-05-28T00:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z"
  };
}

describe("object transforms", () => {
  it("moves a text object by delta", () => {
    const moved = moveTextObject(createText("text-1"), 15, -5);

    expect(moved).toMatchObject({
      id: "text-1",
      x: 25,
      y: 15
    });
  });

  it("moves one text object in a page object list without mutating unrelated objects", () => {
    const firstText = createText("text-1");
    const secondText = createText("text-2", "page-1", 60, 80);
    const stroke = createStroke("stroke-1");
    const objects: CanvasObject[] = [firstText, stroke, secondText];
    const movedObjects = moveObjectInList(objects, "text-2", -10, 20);

    expect(movedObjects[0]).toEqual(firstText);
    expect(movedObjects[1]).toEqual(stroke);
    expect(movedObjects[2]).toMatchObject({
      id: "text-2",
      x: 50,
      y: 100
    });
  });

  it("does not move stroke objects in the MVP transform path", () => {
    const stroke = createStroke("stroke-1");
    const movedObjects = moveObjectInList([stroke], "stroke-1", 30, 40);

    expect(movedObjects[0]).toEqual(stroke);
  });
});

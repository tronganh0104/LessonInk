import type { ToolType } from "../canvas.types";

export type CanvasSpikeTool = Extract<ToolType, "select" | "pen" | "eraser">;


import * as fabric from "fabric";
import { addGrid } from "./addGrid";

interface ImageDetail {
  imageId: string;
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
}

// Reset canvas function with clearing loaded images
export const resetCanvas = (
  canvasInstance: fabric.Canvas | null,
  setImageDetails: Function,
  setRoomIdCounter: Function,
  setAltTextCounters: Function,
  setLoadedImageIds: Function // Add this parameter to reset the loaded image IDs
) => {
  if (!canvasInstance) return;

  // Clear the canvas
  canvasInstance.clear();

  // Re-add the grid after clearing
  addGrid(canvasInstance);

  // Reset state values
  setImageDetails([]);
  setRoomIdCounter(1);
  setAltTextCounters({});
  setLoadedImageIds(new Set()); // Clear loaded images
};

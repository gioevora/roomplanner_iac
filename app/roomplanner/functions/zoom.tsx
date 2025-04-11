import * as fabric from "fabric";
export const handleZoom = (
  canvasInstance: fabric.Canvas | null,
  increase: boolean
) => {
  if (!canvasInstance) return;

  let currentZoom = canvasInstance.getZoom();
  currentZoom *= increase ? 1.1 : 0.9;
  if (currentZoom > 3) currentZoom = 3; // Maximum zoom level
  if (currentZoom < 0.1) currentZoom = 0.1; // Minimum zoom level
  canvasInstance.setZoom(currentZoom);
};

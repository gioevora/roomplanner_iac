import * as fabric from "fabric";

export const addGrid = (
  canvas: fabric.Canvas,
  gridSpacing: number = 50,
  gridColor: string = "black",
  gridOpacity: number = 0.3
): void => {
    const canvasWidth = 10000;
    const canvasHeight = 100000;

  // Clear previous grid lines
  const existingGridLines = canvas.getObjects("line");
  canvas.remove(...existingGridLines);

  const gridLines: fabric.Line[] = [];

  // Set the grid color with opacity
  const gridLineOptions = {
    stroke: gridColor,
    strokeWidth: 1,
    selectable: false, // Make the grid lines non-selectable
    opacity: gridOpacity, // Set opacity of grid lines
  };

  // Create vertical grid lines
  for (let x = 0; x <= canvasWidth; x += gridSpacing) {
    const line = new fabric.Line([x, 0, x, canvasHeight], gridLineOptions);
    gridLines.push(line);
  }

  // Create horizontal grid lines
  for (let y = 0; y <= canvasHeight; y += gridSpacing) {
    const line = new fabric.Line([0, y, canvasWidth, y], gridLineOptions);
    gridLines.push(line);
  }

  // Add all the grid lines to the canvas
  canvas.add(...gridLines);
  canvas.renderAll(); // Re-render the canvas to display the grid
};

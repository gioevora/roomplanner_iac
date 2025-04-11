import { useState } from "react";
import * as fabric from "fabric";

// Define the toggleLabels function
const toggleLabels = (
  canvas: fabric.Canvas | null,
  labelsVisible: boolean,
  setLabelsVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!canvas) return;

  const selectedObject = canvas.getActiveObject();

  if (selectedObject && selectedObject.type === "rect") {
    // If a room (rectangle) is selected, only toggle its associated labels
    const widthLabel = (selectedObject as any).widthLabel;
    const heightLabel = (selectedObject as any).heightLabel;

    // Toggle visibility for the selected room's labels
    if (widthLabel) {
      widthLabel.set("visible", !widthLabel.visible);
    }
    if (heightLabel) {
      heightLabel.set("visible", !heightLabel.visible);
    }
  } else if (selectedObject && selectedObject.type === "image") {
    // If an image is selected, toggle the visibility for its associated labels
    const widthLabel = (selectedObject as any).widthLabel;
    const heightLabel = (selectedObject as any).heightLabel;

    // Toggle visibility for the selected image's labels
    if (widthLabel) {
      widthLabel.set("visible", !widthLabel.visible);
    }
    if (heightLabel) {
      heightLabel.set("visible", !heightLabel.visible);
    }
  } else {
    // If no room or image is selected, toggle visibility for all labels on the canvas
    const allObjects = canvas.getObjects();
    allObjects.forEach((object) => {
      if (
        (object.type === "text" || object.type === "textbox") &&
        object !== selectedObject
      ) {
        object.set("visible", labelsVisible);
      }
    });
  }

  // Toggle the visibility state
  setLabelsVisible((prevState) => !prevState);

  // Re-render the canvas to apply the visibility changes
  canvas.renderAll();
};

export default toggleLabels;

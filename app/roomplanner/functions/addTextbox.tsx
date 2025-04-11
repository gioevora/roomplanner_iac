import * as fabric from "fabric";

// Function to display textbox dimensions
const displayDimensions = (textbox: fabric.Textbox) => {
  const width = textbox.width!;
  const height = textbox.height!;
};

export const addTextbox = (canvas: fabric.Canvas | null) => {
  if (!canvas) return;

  // Create a fabric.js textbox
  const textbox = new fabric.Textbox("Click to edit", {
    left: 100, // Set initial position
    top: 100, // Set initial position
    fontSize: 20,
    width: 200, // Set width
    height: 50, // Set height
    editable: true,
    fill: "black", // Text color
    backgroundColor: "white", // Background color
    fontFamily: "Arial", // Set font family
    fontWeight: "normal", // Set font weight to normal to avoid boldness
  });

  // Add the textbox to the canvas
  canvas.add(textbox);
  canvas.setActiveObject(textbox);
  canvas.renderAll(); // Re-render the canvas to display the new object

  // After adding the textbox, display its dimensions
  displayDimensions(textbox); // Call displayDimensions to show textbox dimensions

  // Add event listeners to update dimensions on selection, moving, scaling, or modification
  textbox.on("selected", () => displayDimensions(textbox));
  textbox.on("moving", () => displayDimensions(textbox));
  textbox.on("scaling", () => displayDimensions(textbox));
  textbox.on("modified", () => displayDimensions(textbox)); // Finalize on modification
};

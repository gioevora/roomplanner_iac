import * as fabric from "fabric";
import { displayDimensions } from "./displayDimension"; // Adjust the import path as needed

// Define types for room data
interface RoomRectWithLabels extends fabric.Rect {
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
  roomIdLabel: fabric.Textbox;
}

interface Room {
  id: string;
  roomRect: RoomRectWithLabels;
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
}

const roomIdCounter = 1; // You may want to track this globally or pass it as a parameter
const rooms: Room[] = []; // Array to store room data
export const createRoom = (
  canvas: fabric.Canvas,
  width: number,
  height: number,
  scaling: number,
  roomId: number,
): { widthLabel: fabric.Textbox; heightLabel: fabric.Textbox; id: string } | false => {
  if (!canvas) return false;
  const roomIdString = `Room-${roomId}`;

  // Calculate initial room dimensions based on scaling factor in pixels
  const roomWidthPx = (width * 100) / scaling;
  const roomHeightPx = (height * 100) / scaling;

  // Create a rectangle representing the room
  const roomRect = new fabric.Rect({
    width: roomWidthPx,
    height: roomHeightPx,
    fill: null,
    stroke: "#808080",
    strokeWidth: 7,
    transparentCorners: false,
    cornerSize: 17,
    cornerStyle: "circle",
    cornerColor: "white",
    cornerStrokeColor: "#808080",
    hasBorders: true,
    lockMovementX: false,
    lockMovementY: false,
    selectable: true,
    evented: true,
    id: roomIdString,  // Set the roomId here
  }) as unknown as RoomRectWithLabels;

  // Create the roomId label with "Room {ID}" format
  const roomIdLabel = new fabric.Textbox(`Room #${roomId}`, {
    fontSize: 22,
    fill: "#000000",
    left: roomRect.left + roomRect.getScaledWidth() / 2,
    top: roomRect.top - 20,
    width: 100,
    editable: false,
    textAlign: "center",
    selectable: false,
    id: `${roomIdString}`,
    zIndex: "1000",
  });

  // Create width and height labels
  const widthLabel = new fabric.Textbox("", {
    fontSize: 18,
    fill: "#000000",
    left: roomRect.left + roomRect.getScaledWidth() / 2,
    top: roomRect.top + roomRect.getScaledHeight() + 10,
    width: 100,
    editable: false,
    textAlign: "center",
    selectable: false,
    id: `${roomIdString}-widthLabel`,
  });

  const heightLabel = new fabric.Textbox("", {
    fontSize: 18,
    fill: "#000000",
    left: roomRect.left - 30,
    top: roomRect.top + roomRect.getScaledHeight() / 2,
    width: 100,
    editable: false,
    textAlign: "center",
    selectable: false,
    id: `${roomIdString}-heightLabel`,
  });

  // Function to update the labels when the room is modified
  const updateLabels = () => {
    // Calculate the current width and height in pixels
    const roomWidth = Math.round(roomRect.width * roomRect.scaleX);
    const roomHeight = Math.round(roomRect.height * roomRect.scaleY);

    // Convert pixel dimensions to meters
    const pixelsPerBox = 50;
    const metersPerBox = 0.5;

    const widthInMeters = (roomWidth / pixelsPerBox) * metersPerBox;
    const heightInMeters = (roomHeight / pixelsPerBox) * metersPerBox;

    // Update width label text and position it on the bottom border
    widthLabel.set({
      text: `${widthInMeters.toFixed(2)} m`,
      left: roomRect.left + roomRect.getScaledWidth() / 2, // Center horizontally at the bottom
      top: roomRect.top + roomRect.getScaledHeight() + 10, // 10 pixels below the room
    });

    // Update roomId label text and position
    roomIdLabel.set({
      text: `Room ${roomId}`,
      left: roomRect.left + roomRect.getScaledWidth() / 5, // Center horizontally
      top: roomRect.top - 80, // 30 pixels above the room (adjust this distance if needed)
    });

    // Update height label text and position it on the left border
    heightLabel.set({
      text: `${heightInMeters.toFixed(2)} m`,
      left: roomRect.left - 30, // Positioned to the left of the room
      top: roomRect.top + roomRect.getScaledHeight() / 2, // Vertically centered
    });

    // Re-render the canvas to update the labels
    canvas.renderAll();
  };

  // Add the room rectangle and labels to the canvas
  canvas.add(roomRect);
  canvas.add(widthLabel, heightLabel, roomIdLabel);
  canvas.centerObject(roomRect);
  canvas.setActiveObject(roomRect);
  canvas.renderAll();

  // Store the labels inside the room object
  roomRect.widthLabel = widthLabel;
  roomRect.heightLabel = heightLabel;
  roomRect.roomIdLabel = roomIdLabel;

  // Set up event listeners to update labels on any modification
  roomRect.on("selected", updateLabels);
  roomRect.on("moving", updateLabels);
  roomRect.on("scaling", updateLabels);
  roomRect.on("modified", updateLabels);

  // Store room data in the global `rooms` array
  rooms.push({
    id: String(roomId), // Convert roomId to a string
    roomRect,
    widthLabel,
    heightLabel,
  });

  return { widthLabel, heightLabel, id: roomIdString };
};


// Helper function to set dimensions (ensure you provide implementation)
function setDimensions(dimensions: { width: number; height: number }): void {

}

// export.tsx
import { jsPDF } from "jspdf";

// Define types for export data
interface ExportData {
  rooms: { [key: string]: { id: string; width: string; height: string; widthLabel: string; heightLabel: string; roomIdLabel: string } };
  images: { imageId: string; widthLabel: string; heightLabel: string }[];
}

export const handleExport = (canvas: any) => {
  if (!canvas) return;

  // Set the background color to white for a clean export
  canvas.backgroundColor = "white";

  // Define the output image size (optional: you can specify the width and height)
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // Create an off-screen canvas to apply watermark
  const offScreenCanvas = document.createElement("canvas");
  const ctx = offScreenCanvas.getContext("2d");

  // Check if ctx is null
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Set the size of the off-screen canvas to match the main canvas
  offScreenCanvas.width = canvasWidth;
  offScreenCanvas.height = canvasHeight;

  // Draw the canvas content onto the off-screen canvas
  const img = new window.Image();
  img.crossOrigin = "anonymous"; // Enable cross-origin access
  img.src = canvas.toDataURL("image/png"); // Export as PNG
  img.onload = () => {
    // Draw the original canvas image onto the off-screen canvas
    ctx.drawImage(img, 0, 0);

    // Now apply the watermark to the off-screen canvas
    const watermarkImg = new window.Image();
    watermarkImg.crossOrigin = "anonymous"; // Enable cross-origin access
    watermarkImg.src = "/infinitech.png"; // Watermark image path
    watermarkImg.onload = () => {
      // Control watermark size (adjust this value to change the size)
      const watermarkSize = 0.15; // 15% of the canvas width/height
      const watermarkWidth = offScreenCanvas.width * watermarkSize;
      const watermarkHeight = offScreenCanvas.height * watermarkSize;

      // Set transparency of the watermark
      ctx.globalAlpha = 0.25; // Set transparency to 25%

      // Draw watermark at the four corners
      ctx.drawImage(watermarkImg, 10, 10, watermarkWidth, watermarkHeight); // Upper Left
      ctx.drawImage(
        watermarkImg,
        offScreenCanvas.width - watermarkWidth - 10,
        10,
        watermarkWidth,
        watermarkHeight
      ); // Upper Right
      ctx.drawImage(
        watermarkImg,
        10,
        offScreenCanvas.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight
      ); // Lower Left
      ctx.drawImage(
        watermarkImg,
        offScreenCanvas.width - watermarkWidth - 10,
        offScreenCanvas.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight
      ); // Lower Right

      // Draw watermark in the center
      ctx.drawImage(
        watermarkImg,
        offScreenCanvas.width / 2 - watermarkWidth / 2,
        offScreenCanvas.height / 2 - watermarkHeight / 2,
        watermarkWidth,
        watermarkHeight
      ); // Center

      // Convert the off-screen canvas back to a data URL (with watermark)
      const finalImage = offScreenCanvas.toDataURL("image/png");

      // Create a downloadable link for the image with watermark
      const a = document.createElement("a");
      a.href = finalImage; // Use the image data with watermark
      a.download = "RoomPlanner.png"; // Set the download file name
      a.click(); // Trigger the download
    };
  };
};

export const exportData = (canvas: any, imageDetails: any[] = []) => {
  const doc = new jsPDF(); // Initialize jsPDF

  if (!canvas) {
    console.error("Canvas not available for export.");
    return;
  }

  // Convert canvas to image (PNG format)
  const canvasImage = canvas.toDataURL({
    format: "png",
    quality: 1,
  });

  // Add canvas image to PDF
  doc.addImage(canvasImage, "PNG", 10, 10, 180, 120); // Position: (10,10), Size: 180x120

  // Define export data structure
  const exportData: ExportData = {
    rooms: {},
    images: [],
  };

  // Regular expression to match room titles like "Room-1", "Room-2"
  const roomRegex = /^Room-\d+$/;

  // Collect room details
  canvas.getObjects().forEach((obj: any) => {
    if (
      obj.id &&
      roomRegex.test(obj.id) && // Ensures only valid room names are captured
      obj.type === "rect" && // Ensures it's a room and not a label
      !obj.id.includes("-widthLabel") &&
      !obj.id.includes("-heightLabel")
    ) {
      const pixelsPerBox = 50;
      const metersPerBox = 0.5;
      const widthInMeters = ((obj.width * obj.scaleX) / pixelsPerBox) * metersPerBox;
      const heightInMeters = ((obj.height * obj.scaleY) / pixelsPerBox) * metersPerBox;

      // Find width and height labels
      const widthLabelObj = canvas.getObjects().find((o: any) => o.id === `${obj.id}-widthLabel`);
      const heightLabelObj = canvas.getObjects().find((o: any) => o.id === `${obj.id}-heightLabel`);
      const roomIdLabelObj = canvas.getObjects().find((o: any) => o.id === obj.id);

      // Use the room ID as a fallback label if no label is found
      const roomLabel = roomIdLabelObj && roomIdLabelObj.text ? roomIdLabelObj.text : obj.id;

      exportData.rooms[obj.id] = {
        id: obj.id,
        width: widthInMeters.toFixed(2),
        height: heightInMeters.toFixed(2),
        widthLabel: widthLabelObj ? widthLabelObj.text : "",
        heightLabel: heightLabelObj ? heightLabelObj.text : "",
        roomIdLabel: roomLabel, // Use room ID if label is missing
      };
    }
  });

  // Collect image details
  imageDetails.forEach((imageDetail) => {
    exportData.images.push({
      imageId: imageDetail.imageId,
      widthLabel: imageDetail.widthLabel.text,
      heightLabel: imageDetail.heightLabel.text,
    });
  });

  // Set up table title
  doc.setFontSize(12);
  doc.text("Room and Image Details:", 14, 140); // Position text below canvas

  // Define table headers
  const tableHeaders = ["Item Name", "Width (m)", "Height (m)"];
  const colWidths = [60, 40, 40]; // Define column widths

  // Set table header styles
  let yPosition = 150;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");

  // Draw table header
  let xPosition = 14;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });

  yPosition += 8; // Move to next line after header
  doc.setFont("helvetica", "normal");

  // Add room details to table
  Object.values(exportData.rooms).forEach((room: any) => {
    xPosition = 14;
    doc.text(room.roomIdLabel, xPosition, yPosition);
    doc.text(`${room.width}`, xPosition + 60, yPosition);
    doc.text(`${room.height}`, xPosition + 100, yPosition);
    yPosition += 8; // Move to next line
  });

  // Add image details to table
  exportData.images.forEach((image) => {
    xPosition = 14;
    doc.text(image.imageId, xPosition, yPosition);
    doc.text(`${image.widthLabel}`, xPosition + 60, yPosition);
    doc.text(`${image.heightLabel}`, xPosition + 100, yPosition);
    yPosition += 8; // Move to next line
  });

  // Save the PDF file
  doc.save("RoomPlanner.pdf");

  console.log("Exported Data:", exportData);
};

"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import * as fabric from "fabric";
import { displayDimensions } from "./functions/displayDimension"; // Adjust the import path based on your project structure
import { handleZoom } from "./functions/zoom"; // Import zoom function
import { addGrid } from "./functions/addGrid"; // Import default export

import { createRoom } from "./functions/generateRoom"; // Import createRoom function
import { handleExport, exportData } from "./functions/export";
import { handleItemClick } from "./functions/genarateImage";
import { resetCanvas } from "./functions/resetCanva"; // Import the function
import { addTextbox } from "./functions/addTextbox";
import toggleLabels from "./functions/toggleLabels"; // Import the function
import { furnitureData } from "@/app/data/furnitureData";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
interface FurnitureItem {
  name: string;
  picture: string;
  width: number;
  height: number;
  category: string;
}

type ImageDetail = {
  imageId: string;
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
};
// Custom type for fabric.Image with additional properties (for images)
interface CustomFabricImage extends fabric.Image {
  id?: string;
  widthLabel?: fabric.Textbox;
  heightLabel?: fabric.Textbox;
  imgIdLabel?: fabric.Textbox;
}
import { useParams } from "next/navigation";
// Custom type for fabric.Rect with labels for rooms
interface RoomRectWithLabels extends fabric.Rect {
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
  roomIdLabel: fabric.Textbox;
}

const RoomPlanner: React.FC = () => {
  const { slug } = useParams(); // Capture the dynamic slug from the URL
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [loading, setLoading] = useState(true);
  const [altTextCounters, setAltTextCounters] = useState({});
  const [imageDetails, setImageDetails] = useState<ImageDetail[]>([]);
  const [roomIdCounter, setRoomIdCounter] = useState(1);
  const [loadedImageIds, setLoadedImageIds] = useState(new Set<string>());

  const [labelsVisible, setLabelsVisible] = useState<boolean>(true);
  const isEmpty = !Array.isArray(furniture) || furniture.length === 0;
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchedFurniture = furnitureData[slug as string] || [];
    setFurniture(fetchedFurniture);
    console.log(slug, fetchedFurniture);
  }, [slug]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const groupedFurniture = useMemo(() => {

    if (!furniture || !Array.isArray(furniture)) return {}; // Ensure furniture is a valid array

    return furniture.reduce<Record<string, FurnitureItem[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [furniture]);


  // Your room creation and display logic
  const handleRoomGeneration = (): void => {
    if (canvasInstance) {
      const width = 5; // in meters
      const height = 5; // in meters
      const scaling = 1; // Adjust scaling factor as needed

      const roomData = createRoom(canvasInstance, width, height, scaling, roomIdCounter);

      if (roomData) {
        // Increment roomIdCounter after creating the room
        setRoomIdCounter(prev => prev + 1);
      }
    }
  };


  const deleteElement = (canvas: fabric.Canvas | null) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      if (activeObject instanceof fabric.Rect) {
        // Handle deleting a room (roomRect)
        const room = activeObject as RoomRectWithLabels;
        canvas.remove(room);
        if (room.widthLabel) canvas.remove(room.widthLabel);
        if (room.heightLabel) canvas.remove(room.heightLabel);
        if (room.roomIdLabel) canvas.remove(room.roomIdLabel);
      } else if (activeObject instanceof fabric.Image) {
        // Handle deleting an image
        const image = activeObject as CustomFabricImage;
        canvas.remove(image);
        if (image.widthLabel) canvas.remove(image.widthLabel);
        if (image.heightLabel) canvas.remove(image.heightLabel);
        if (image.imgIdLabel) canvas.remove(image.imgIdLabel);
      } else if (activeObject instanceof fabric.Textbox) {
        // Handle deleting a textbox
        const textbox = activeObject as fabric.Textbox;
        canvas.remove(textbox);
      }

      canvas.renderAll(); // Re-render the canvas to apply changes
    } else {
      console.error("No active object selected.");
    }
  };

  const initCanvas = (): void => {
    if (canvasInstance) {
      canvasInstance.dispose(); // Dispose of the existing canvas if any
    }

    // Create a new canvas instance
    const newCanvas = new fabric.Canvas("canvas", {
      width: window.innerWidth,
      height: window.innerHeight,
      preserveObjectStacking: true, // Maintain correct stacking order
    });

    // Add the grid to the new canvas
    addGrid(newCanvas);

    // Update the state with the new canvas instance
    setCanvasInstance(newCanvas);
  };

  useEffect(() => {
    initCanvas();
    setTimeout(() => initCanvas(), 100); // Call 2nd time after 100ms

    return () => {
      canvasInstance?.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvasInstance) {
      // Add event listeners to canvas to update dimensions when objects are moved or resized
      const updateDimensions = (event: any) => {
        const { target } = event;
        if (target && target.width && target.height) {
          displayDimensions(target, setDimensions); // Update the dimensions state
        }
      };

      canvasInstance.on("object:modified", updateDimensions);
      canvasInstance.on("object:moving", updateDimensions);
      canvasInstance.on("object:scaling", updateDimensions);

      return () => {
        canvasInstance.off("object:modified", updateDimensions);
        canvasInstance.off("object:moving", updateDimensions);
        canvasInstance.off("object:scaling", updateDimensions);
      };
    }
  }, [canvasInstance]); // Make sure canvasInstance is updated
  if (isEmpty) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 text-white text-2xl font-bold">
        Data is not available. Please try again later.
      </div>
    );
  }



  return (
    <div className="flex flex-col header-container overflow-hidden h-screen">
      {/* Header & Buttons */}
      <div className="header-container bg-blue-500">
        <div className="button-container flex flex-wrap gap-1 justify-center p-3 bg-blue-500">
          <button
            onClick={() => {
              resetCanvas(canvasInstance, setImageDetails, setRoomIdCounter, setAltTextCounters, setLoadedImageIds);
              initCanvas();
            }}
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            New
          </button>



          <button
            onClick={handleRoomGeneration}
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            Add Room
          </button>
          <button
            onClick={() => addTextbox(canvasInstance)} // Pass canvasInstance to the addTextbox function
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            Add Text
          </button>
          <button
            onClick={() => deleteElement(canvasInstance)} // Call deleteElement
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36">
            Delete
          </button>

          <button
            onClick={() => handleZoom(canvasInstance, true)} // Zoom In
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            Zoom In
          </button>
          <button
            onClick={() => handleZoom(canvasInstance, false)} // Zoom Out
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            Zoom Out
          </button>

          <div className="relative">
            {/* Main Export Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
            >
              Export
            </button>

            {/* Popup Modal */}
            {isOpen && (
              <div ref={popupRef} className="absolute top-14 left-0 bg-white border shadow-lg rounded-lg p-2 w-40 z-50">
                <button
                  onClick={() => {
                    handleExport(canvasInstance);
                    setIsOpen(false);
                  }}
                  className="block w-full text-center px-2 py-2 text-black hover:bg-gray-200 rounded-md border-black"
                >
                  Export to Image
                </button>
                <button
                  onClick={() => {
                    exportData(canvasInstance, imageDetails);
                    setIsOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 text-black hover:bg-gray-200 rounded-md"
                >
                  Export to PDF
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleLabels(canvasInstance, labelsVisible, setLabelsVisible)}
            className="h-12 bg-blue-600 text-white text-md rounded-lg px-4 py-2 hover:opacity-90 w-36"
          >
            On/Off Label
          </button>

        </div>
      </div>

      <div className="flex w-full h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-white p-2 h-full max-h-screen overflow-y-auto flex-shrink-0 relative z-10">
          <Accordion type="single" collapsible>
            {Object.entries(groupedFurniture).map(([category, items]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="w-full">{category}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    {items.map((item) => (
                      <div key={item.name} className="text-center">
                        <h4>{item.name}</h4>
                        <p>
                          {item.width} x {item.height}
                        </p>
                        <img
                          src={`https://roomplanner-nu.vercel.app${item.picture}`}
                          alt={item.name}
                          className="cursor-pointer w-20 h-20 mx-auto"
                          data-category={item.category}
                          data-picture={item.picture}
                          data-width={item.width}
                          data-height={item.height}
                          onClick={(e) =>
                            handleItemClick(
                              e.target as HTMLImageElement,
                              canvasInstance,
                              setAltTextCounters,
                              setImageDetails,
                              setLoadedImageIds,
                              loadedImageIds
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Canvas Section */}
        <div className="flex-grow flex justify-center items-center relative bg-gray-100">
          <canvas id="canvas" className="border border-black w-full h-full"></canvas>

          {/* Dimension Display */}
          <div
            id="dimensionDisplay"
            className=" text-lg w-auto left-80 fixed top-10 bg-white text-black p-2 border-2 border-black rounded z-10 xl:top-20 mt-2"
          >
            <p>Height: {dimensions.height.toFixed(2)} m</p>
            <p>Width: {dimensions.width.toFixed(2)} m</p>
          </div>
        </div>


      </div>

    </div >
  );
};

export default RoomPlanner;

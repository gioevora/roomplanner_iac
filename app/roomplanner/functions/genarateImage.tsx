import * as fabric from "fabric";

// Extend fabric.Image to include custom properties
interface CustomFabricImage extends fabric.Image {
  id?: string;
  widthLabel?: fabric.Textbox;
  heightLabel?: fabric.Textbox;
  imgIdLabel?: fabric.Textbox;
}

// Define types for state setters
type AltTextCounters = Record<string, number>;
type ImageDetail = {
  imageId: string;
  widthLabel: fabric.Textbox;
  heightLabel: fabric.Textbox;
};
type SetAltTextCounters = React.Dispatch<React.SetStateAction<AltTextCounters>>;
type SetImageDetails = React.Dispatch<React.SetStateAction<ImageDetail[]>>;

export const handleItemClick = (
  item: HTMLImageElement,
  canvas: fabric.Canvas | null,
  setAltTextCounters: SetAltTextCounters,
  setImageDetails: SetImageDetails,
  setLoadedImageIds: React.Dispatch<React.SetStateAction<Set<string>>>, // Updated to set loaded image IDs
  loadedImageIds: Set<string> // Pass the loadedImageIds state as a parameter
) => {
  if (!canvas) {
    console.error("Canvas not initialized yet.");
    return;
  }
  

  const category = item.dataset.category;
  const picture = item.dataset.picture;

  if (!category || !picture) {
    console.error("Missing category or picture data.");
    return;
  }

  const scaling = 1;
  const width = (Number(item.dataset.width) * 2.8) / scaling;
  const height = (Number(item.dataset.height) * 2.8) / scaling;

  const imageURL = `/${encodeURIComponent(picture)}`;

  const altText = item.getAttribute("alt") || "";
  const imgElement = new window.Image();
  imgElement.src = imageURL;

  setAltTextCounters((prevCounters) => {
    const newCounters = { ...prevCounters };
    const newCount = (newCounters[altText] || 0) + 1;
    newCounters[altText] = newCount;

    const imageId = `${altText} item-${newCount}`;

    // If image has already been loaded, skip
    if (loadedImageIds.has(imageId)) {
      return newCounters;
    }

    imgElement.onload = () => {
      if (!canvas) return; // Skip if canvas was reset before image loaded

      const img = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
        scaleX: width / imgElement.width,
        scaleY: height / imgElement.height,
      }) as CustomFabricImage;

      img.id = imageId;
      setLoadedImageIds(new Set(loadedImageIds.add(imageId))); // Track the image

      canvas.add(img);
      canvas.centerObject(img);
      canvas.renderAll();

      // Labels
      const imgIdLabel = new fabric.Textbox(imageId, {
        fontSize: 22,
        fill: "#000000",
        width: 300,
        editable: false,
        textAlign: "center",
        selectable: false,
        zIndex: "1000",
      });

      const widthLabel = new fabric.Textbox("", {
        editable: false,
        fontSize: 10,
        fill: "#000000",
        selectable: false,
      });

      const heightLabel = new fabric.Textbox("", {
        editable: false,
        fontSize: 10,
        fill: "#000000",
        selectable: false,
      });

      const updateLabels = () => {
        if (!img || !canvas) return; // Skip updates if canvas reset

        const imgWidth = Math.round(img.width! * img.scaleX!);
        const imgHeight = Math.round(img.height! * img.scaleY!);
        const pixelsPerBox = 50;
        const metersPerBox = 0.5;
        const widthInMeters = (imgWidth / pixelsPerBox) * metersPerBox;
        const heightInMeters = (imgHeight / pixelsPerBox) * metersPerBox;
        const enlargedFontSize = 14;

        imgIdLabel.set({
          text: `${imageId}`,
          left: img.left! - 80,
          top: img.top! - 80,
        });

        widthLabel.set({
          text: `${widthInMeters.toFixed(2)} m`,
          left: img.left! + img.getScaledWidth() / 2,
          top: img.top! + img.getScaledHeight() + 10,
          fontSize: enlargedFontSize,
        });

        heightLabel.set({
          text: `${heightInMeters.toFixed(2)} m`,
          left: img.left! - 30,
          top: img.top! + img.getScaledHeight() / 2,
          fontSize: enlargedFontSize,
        });

        canvas.renderAll();
      };

      canvas.add(widthLabel, heightLabel, imgIdLabel);
      updateLabels();

      img.on("selected", updateLabels);
      img.on("moving", updateLabels);
      img.on("scaling", updateLabels);
      img.on("modified", updateLabels);

      img.widthLabel = widthLabel;
      img.heightLabel = heightLabel;
      img.imgIdLabel = imgIdLabel;

      setImageDetails((prevDetails) => [
        ...prevDetails,
        { imageId, widthLabel, heightLabel },
      ]);
    };

    imgElement.onerror = (error) => {
      console.error("Error loading image:", error);
    };

    return newCounters;
  });
};

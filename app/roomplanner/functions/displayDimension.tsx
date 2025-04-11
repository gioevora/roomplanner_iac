export const displayDimensions = (roomRect: any, setDimensions: (dimensions: { width: number; height: number }) => void) => {
  const roomWidth = Math.round(roomRect.width * roomRect.scaleX);
  const roomHeight = Math.round(roomRect.height * roomRect.scaleY);

  const pixelsPerBox = 50;
  const metersPerBox = 0.5;

  const widthInMeters = (roomWidth / pixelsPerBox) * metersPerBox;
  const heightInMeters = (roomHeight / pixelsPerBox) * metersPerBox;

  setDimensions({
    width: widthInMeters,
    height: heightInMeters,
  });
};

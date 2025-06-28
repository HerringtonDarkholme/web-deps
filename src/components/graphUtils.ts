export function calculateCenteredViewport({
  width,
  height,
  canvasWidth,
  canvasHeight,
  initialScale
}: {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  initialScale: number;
}) {
  const centerX = (width - canvasWidth * initialScale) / 2;
  const centerY = (height - canvasHeight * initialScale) / 2;
  return {
    scale: initialScale,
    translateX: centerX,
    translateY: centerY
  };
} 
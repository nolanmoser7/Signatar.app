import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number; // width/height ratio, undefined for free crop
  title: string;
}

export function ImageCropper({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  aspectRatio,
  title
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState([100]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState([0]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = 400;
    const canvasHeight = aspectRatio ? canvasWidth / aspectRatio : 400;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotation[0] * Math.PI) / 180);
    ctx.scale(scale[0] / 100, scale[0] / 100);
    ctx.translate(-canvasWidth / 2 + position.x, -canvasHeight / 2 + position.y);

    // Draw image
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

    // Restore context
    ctx.restore();

    // Draw crop area overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Clear crop area
    const cropWidth = aspectRatio ? Math.min(canvasWidth, canvasHeight * aspectRatio) : canvasWidth;
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : canvasHeight;
    const cropX = (canvasWidth - cropWidth) / 2;
    const cropY = (canvasHeight - cropHeight) / 2;
    
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    
    // Redraw image in crop area only
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropWidth, cropHeight);
    ctx.clip();
    
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotation[0] * Math.PI) / 180);
    ctx.scale(scale[0] / 100, scale[0] / 100);
    ctx.translate(-canvasWidth / 2 + position.x, -canvasHeight / 2 + position.y);
    
    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // Draw crop border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
  }, [scale, position, rotation, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;

    const cropSize = aspectRatio === 1 ? 300 : aspectRatio && aspectRatio > 1 ? 400 : 300;
    finalCanvas.width = cropSize;
    finalCanvas.height = aspectRatio ? cropSize / aspectRatio : cropSize;

    const canvasWidth = 400;
    const canvasHeight = aspectRatio ? canvasWidth / aspectRatio : 400;
    const cropWidth = aspectRatio ? Math.min(canvasWidth, canvasHeight * aspectRatio) : canvasWidth;
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : canvasHeight;
    const cropX = (canvasWidth - cropWidth) / 2;
    const cropY = (canvasHeight - cropHeight) / 2;

    finalCtx.drawImage(
      canvas,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, finalCanvas.width, finalCanvas.height
    );

    const croppedImageUrl = finalCanvas.toDataURL("image/png");
    onCropComplete(croppedImageUrl);
    onClose();
  };

  const resetTransforms = () => {
    setScale([100]);
    setPosition({ x: 0, y: 0 });
    setRotation([0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop and Position {title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="hidden"
                onLoad={drawCanvas}
                onError={(e) => console.error("Image load error:", e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Scale: {scale[0]}%
              </label>
              <Slider
                value={scale}
                onValueChange={(value) => {
                  setScale(value);
                  setTimeout(drawCanvas, 0);
                }}
                min={50}
                max={200}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Rotation: {rotation[0]}°
              </label>
              <Slider
                value={rotation}
                onValueChange={(value) => {
                  setRotation(value);
                  setTimeout(drawCanvas, 0);
                }}
                min={-180}
                max={180}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Move className="w-4 h-4" />
            Click and drag on the image to reposition
          </div>

          <Button
            variant="outline"
            onClick={resetTransforms}
            className="w-full"
          >
            Reset Position
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
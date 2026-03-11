import React, { useState, useRef, useEffect } from "react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImageDataUrl: string) => void;
  size: { width: number; height: number }; // Target size (24x24)
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  size,
}: ImageCropModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        // Calculate initial scale to fit within the larger container (h-96 = 384px)
        const containerSize = 384; // h-96 = 384px
        const scaleX = containerSize / img.width;
        const scaleY = containerSize / img.height;
        // Start with image fitting within the frame
        const initialScale = Math.min(scaleX, scaleY) * 0.9; // Slightly smaller to fit nicely
        setScale(initialScale);
        setPosition({ x: 0, y: 0 }); // Reset position
        lastPosition.current = { x: 0, y: 0 };
        setImageLoaded(true);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setPosition({ x: 0, y: 0 });
      lastPosition.current = { x: 0, y: 0 };
      setIsDragging(false);
    }
  }, [isOpen]);

  // Global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      setPosition({ x: newX, y: newY });
      lastPosition.current = { x: newX, y: newY };
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - lastPosition.current.x,
      y: e.clientY - lastPosition.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handled by global listener when dragging
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => {
      const newScale = Math.max(0.5, Math.min(3, prev * delta));
      return newScale;
    });
  };

  const handleSave = () => {
    if (!imageRef.current || !containerRef.current || !imageLoaded) return;

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Get container dimensions (the entire frame is the crop area)
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const scaledImageWidth = imageDimensions.width * scale;
    const scaledImageHeight = imageDimensions.height * scale;

    // The image is centered at (50% + position.x, 50% + position.y)
    const imageCenterX = containerWidth / 2 + position.x;
    const imageCenterY = containerHeight / 2 + position.y;
    
    // Calculate the visible portion of the image within the container
    const imageLeftEdge = imageCenterX - scaledImageWidth / 2;
    const imageTopEdge = imageCenterY - scaledImageHeight / 2;
    
    // Calculate what part of the image is visible in the container
    const visibleLeft = Math.max(0, -imageLeftEdge);
    const visibleTop = Math.max(0, -imageTopEdge);
    const visibleRight = Math.min(scaledImageWidth, containerWidth - imageLeftEdge);
    const visibleBottom = Math.min(scaledImageHeight, containerHeight - imageTopEdge);
    
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;

    // Convert visible area to original image coordinates
    const sourceX = visibleLeft / scale;
    const sourceY = visibleTop / scale;
    const sourceWidth = visibleWidth / scale;
    const sourceHeight = visibleHeight / scale;

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(sourceX, imageDimensions.width));
    const clampedY = Math.max(0, Math.min(sourceY, imageDimensions.height));
    const clampedWidth = Math.min(sourceWidth, imageDimensions.width - clampedX);
    const clampedHeight = Math.min(sourceHeight, imageDimensions.height - clampedY);

    // Draw the visible portion, scaled to fit 24x24
    ctx.drawImage(
      imageRef.current,
      clampedX,
      clampedY,
      clampedWidth,
      clampedHeight,
      0,
      0,
      size.width,
      size.height
    );

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#25252A]">
            Adjust Icon Position
          </h3>
          <button
            onClick={onClose}
            className="text-[#5D666F] hover:text-[#25252A]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <div
            ref={containerRef}
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-4 border-blue-500 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            {imageLoaded && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                className="absolute select-none max-w-full max-h-full object-contain"
                style={{
                  width: `${imageDimensions.width * scale}px`,
                  height: `${imageDimensions.height * scale}px`,
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  transform: "translate(-50%, -50%)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
            )}
          </div>
          <div className="mt-2 text-sm text-[#5D666F] text-center">
            Drag to position • Scroll to zoom • Fit image within the frame • Final size: {size.width}×{size.height}px
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#DEE5EB] rounded-lg text-sm font-semibold text-[#25252A] hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#205AE3] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4bc7]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


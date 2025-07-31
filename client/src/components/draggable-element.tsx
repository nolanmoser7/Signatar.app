import { useState, useRef, useEffect } from "react";

interface DraggableElementProps {
  children: React.ReactNode;
  elementId: string;
  position: { x: number; y: number; scale: number };
  onPositionChange: (elementId: string, position: { x: number; y: number; scale: number }) => void;
  layoutMode: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DraggableElement({
  children,
  elementId,
  position,
  onPositionChange,
  layoutMode,
  className = "",
  style = {}
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isScaling, setIsScaling] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!layoutMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is holding Shift for scaling
    if (e.shiftKey) {
      setIsScaling(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!layoutMode || (!isDragging && !isScaling)) return;

    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      onPositionChange(elementId, {
        x: newX,
        y: newY,
        scale: position.scale
      });
    } else if (isScaling) {
      const deltaY = dragStart.y - e.clientY;
      const scaleChange = deltaY * 0.01;
      const newScale = Math.max(0.3, Math.min(3, position.scale + scaleChange));

      onPositionChange(elementId, {
        x: position.x,
        y: position.y,
        scale: newScale
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScaling(false);
  };

  useEffect(() => {
    if (isDragging || isScaling) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isScaling, dragStart, position]);

  const transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale})`;

  return (
    <div
      ref={elementRef}
      className={`relative ${className} ${layoutMode ? 'cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50 select-none' : ''} ${isDragging || isScaling ? 'z-50 ring-2 ring-blue-500' : layoutMode ? 'z-10' : ''}`}
      style={{
        ...style,
        transform,
        transformOrigin: 'center',
        transition: (isDragging || isScaling) ? 'none' : 'transform 0.2s ease-out'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {layoutMode && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-50 pointer-events-none rounded" />
          <div className="absolute -top-8 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded text-center min-w-max pointer-events-none">
            {elementId} - Drag to move, Shift+Drag to scale
          </div>
        </>
      )}
    </div>
  );
}
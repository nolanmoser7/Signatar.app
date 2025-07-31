import { useState, useRef, useEffect } from "react";

interface DraggableElementProps {
  children: React.ReactNode;
  elementId: string;
  position: { x: number; y: number; scale: number };
  onPositionChange: (elementId: string, position: { x: number; y: number; scale: number }) => void;
  layoutMode: boolean;
  className?: string;
}

export default function DraggableElement({
  children,
  elementId,
  position,
  onPositionChange,
  layoutMode,
  className = ""
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!layoutMode) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !layoutMode) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    onPositionChange(elementId, {
      x: newX,
      y: newY,
      scale: position.scale
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, position.scale]);

  const transform = `translate(${position.x}px, ${position.y}px) scale(${position.scale})`;

  return (
    <div
      ref={elementRef}
      className={`${className} ${layoutMode ? 'cursor-move hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50' : ''} ${isDragging ? 'z-10 ring-2 ring-blue-500' : ''}`}
      style={{
        transform,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out'
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {layoutMode && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-50 pointer-events-none" />
      )}
    </div>
  );
}
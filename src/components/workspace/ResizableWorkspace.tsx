import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ResizableWorkspaceProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number; // percentage 0 - 100 (e.g. 50)
  minLeftPct?: number;
  minRightPct?: number;
  className?: string;
}

export function ResizableWorkspace({
  leftPanel,
  rightPanel,
  defaultSplit = 50,
  minLeftPct = 25,
  minRightPct = 25,
  className,
}: ResizableWorkspaceProps) {
  const [split, setSplit] = React.useState(defaultSplit);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newSplit = ((e.clientX - rect.left) / rect.width) * 100;
    const boundedSplit = Math.max(minLeftPct, Math.min(100 - minRightPct, newSplit));
    setSplit(boundedSplit);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-col md:flex-row h-full w-full rounded-xl border border-[#E4E7EC] overflow-hidden bg-white shadow-xs',
        className
      )}
    >
      {/* Left / Top Panel */}
      <div
        className="h-full overflow-hidden flex flex-col"
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${split}%` : '100%' }}
      >
        {leftPanel}
      </div>

      {/* Resize Handle Divider */}
      <div
        onMouseDown={handleMouseDown}
        className="hidden md:flex w-2.5 items-center justify-center bg-slate-100 hover:bg-[#2563EB]/15 transition-colors cursor-col-resize select-none shrink-0 group z-10"
        title="Drag to resize panels"
      >
        <div className="h-8 w-1 rounded-full bg-slate-300 group-hover:bg-[#2563EB] transition-colors" />
      </div>

      {/* Right / Bottom Panel */}
      <div
        className="h-full overflow-hidden flex flex-col flex-1"
        style={{ width: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${100 - split}%` : '100%' }}
      >
        {rightPanel}
      </div>
    </div>
  );
}

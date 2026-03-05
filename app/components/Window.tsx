import Draggable from "react-draggable";
import { useRef, useState } from "react";

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  defaultPosition: { x: number; y: number };
  width?: number;
  height?: number;
  isMinimized?: boolean;
}

export default function Window({
  title,
  children,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  defaultPosition,
  width = 720,
  height = 500,
  isMinimized = false,
}: WindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const windowContent = (
    <div
      ref={nodeRef}
      style={
        isMaximized
          ? {
              zIndex,
              position: "fixed",
              top: 28,
              left: 0,
              width: "100vw",
              height: "calc(100vh - 28px - 80px)",
              visibility: isMinimized ? "hidden" : "visible",
              pointerEvents: isMinimized ? "none" : "auto",
            }
          : {
              zIndex,
              width,
              height,
              visibility: isMinimized ? "hidden" : "visible",
              pointerEvents: isMinimized ? "none" : "auto",
            }
      }
      className={`flex flex-col bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/70 overflow-hidden ${isMaximized ? "" : "absolute rounded-xl"}`}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div className="win-titlebar shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] border-b border-white/10 cursor-move select-none">
        <div className="flex items-center gap-1.5">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="win-btn w-4 h-4 rounded-full bg-[#ff5f56] hover:brightness-125 transition-all group relative"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/70 opacity-0 group-hover:opacity-100 font-bold leading-none">✕</span>
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="win-btn w-4 h-4 rounded-full bg-[#ffbd2e] hover:brightness-125 transition-all group relative"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/70 opacity-0 group-hover:opacity-100 font-bold leading-none">−</span>
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setIsMaximized((v) => !v); }}
            className="win-btn w-4 h-4 rounded-full bg-[#27c93f] hover:brightness-125 transition-all group relative"
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-black/70 opacity-0 group-hover:opacity-100 font-bold leading-none">
              {isMaximized ? "⤡" : "⤢"}
            </span>
          </button>
        </div>
        <span className="flex-1 text-center text-xs text-gray-400 font-mono truncate px-4">
          {title}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );

  if (isMaximized) {
    return windowContent;
  }

  return (
    <Draggable
      nodeRef={nodeRef as React.RefObject<HTMLElement>}
      handle=".win-titlebar"
      cancel=".win-btn"
      defaultPosition={defaultPosition}
      bounds={{ top: 30, left: 0 }}
    >
      {windowContent}
    </Draggable>
  );
}

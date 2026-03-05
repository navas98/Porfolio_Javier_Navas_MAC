import { useState, useRef, useCallback, useEffect } from "react";

interface PhotoViewerProps {
  src: string;
  name: string;
}

type Tool = "move" | "zoom-in" | "zoom-out";

const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.66, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function PhotoViewer({ src, name }: PhotoViewerProps) {
  const [zoom, setZoom]         = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [tool, setTool]         = useState<Tool>("move");
  const [imgSize, setImgSize]   = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);

  const canvasRef  = useRef<HTMLDivElement>(null);
  const dragStart  = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  // Center image on load
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    fitToWindow(img.naturalWidth, img.naturalHeight);
  };

  const fitToWindow = useCallback((w = imgSize.w, h = imgSize.h) => {
    if (!canvasRef.current || w === 0) return;
    const cw = canvasRef.current.clientWidth;
    const ch = canvasRef.current.clientHeight;
    const scale = Math.min(cw / w, ch / h, 1) * 0.9;
    setZoom(scale);
    setOffset({ x: 0, y: 0 });
  }, [imgSize]);

  const zoomTo = useCallback((newZoom: number) => {
    setZoom(clamp(newZoom, 0.05, 32));
  }, []);

  const zoomIn = () => {
    const next = ZOOM_STEPS.find((s) => s > zoom) ?? zoom * 1.5;
    zoomTo(next);
  };

  const zoomOut = () => {
    const prev = [...ZOOM_STEPS].reverse().find((s) => s < zoom) ?? zoom / 1.5;
    zoomTo(prev);
  };

  // Scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => clamp(z * factor, 0.05, 32));
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool !== "move") return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Click canvas to zoom in/out
  const handleCanvasClick = () => {
    if (tool === "zoom-in")  zoomIn();
    if (tool === "zoom-out") zoomOut();
  };

  const zoomPercent = Math.round(zoom * 100);

  const tools: { id: Tool; icon: string; title: string }[] = [
    { id: "move",     icon: "✥",  title: "Mover (V)" },
    { id: "zoom-in",  icon: "🔍+", title: "Zoom + (Z)" },
    { id: "zoom-out", icon: "🔍−", title: "Zoom − (Alt+Z)" },
  ];

  return (
    <div className="h-full flex flex-col bg-[#3c3c3c] font-mono text-xs select-none">

      {/* ── Fake PS menu bar ─────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-0 px-1 bg-[#2b2b2b] border-b border-black/40 text-gray-400 text-[11px]">
        {["Archivo", "Editar", "Imagen", "Capa", "Ver", "Ventana"].map((m) => (
          <span key={m} className="px-2.5 py-1 hover:bg-white/10 cursor-default rounded">{m}</span>
        ))}
      </div>

      {/* ── Options bar ──────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-1 bg-[#323232] border-b border-black/30 text-gray-300">
        <span className="text-gray-500">Zoom:</span>
        <input
          type="number"
          value={zoomPercent}
          onChange={(e) => zoomTo(Number(e.target.value) / 100)}
          className="w-14 bg-[#1a1a1a] border border-white/10 rounded px-1 py-0.5 text-right text-gray-200 text-[11px] focus:outline-none focus:border-blue-500"
        />
        <span className="text-gray-500">%</span>
        <div className="h-3 w-px bg-white/10 mx-1" />
        <button onClick={() => fitToWindow()} className="px-2 py-0.5 bg-[#444] hover:bg-[#555] rounded text-[11px] text-gray-300">
          Ajustar
        </button>
        <button onClick={() => zoomTo(1)} className="px-2 py-0.5 bg-[#444] hover:bg-[#555] rounded text-[11px] text-gray-300">
          100%
        </button>
      </div>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left toolbar */}
        <div className="shrink-0 w-10 bg-[#2b2b2b] border-r border-black/40 flex flex-col items-center pt-2 gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              title={t.title}
              onClick={() => setTool(t.id)}
              className={`w-8 h-8 rounded flex items-center justify-center text-base transition-colors ${
                tool === t.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.icon}
            </button>
          ))}
          <div className="w-6 h-px bg-white/10 my-1" />
          <button title="Zoom +" onClick={zoomIn}  className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white text-lg font-bold">+</button>
          <button title="Zoom −" onClick={zoomOut} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white text-lg font-bold">−</button>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-hidden relative"
          style={{
            cursor: tool === "move" ? (dragging ? "grabbing" : "grab") : tool === "zoom-in" ? "zoom-in" : "zoom-out",
            // Checkerboard background like Photoshop
            backgroundImage: "linear-gradient(45deg,#444 25%,transparent 25%),linear-gradient(-45deg,#444 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#444 75%),linear-gradient(-45deg,transparent 75%,#444 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
            backgroundColor: "#383838",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onClick={handleCanvasClick}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={src}
              alt={name}
              onLoad={handleImgLoad}
              draggable={false}
              className="block shadow-2xl shadow-black/80"
              style={{ imageRendering: zoom > 2 ? "pixelated" : "auto" }}
            />
          </div>
        </div>

        {/* Right panel — info */}
        <div className="shrink-0 w-44 bg-[#2b2b2b] border-l border-black/40 flex flex-col text-[11px] text-gray-400 overflow-auto">
          {/* Histogram-style header */}
          <div className="px-3 py-2 bg-[#252525] border-b border-black/30 text-gray-300 font-bold tracking-wide uppercase text-[10px]">
            Info
          </div>
          <div className="p-3 space-y-3">
            <div>
              <p className="text-gray-500 uppercase text-[9px] tracking-wider mb-1">Archivo</p>
              <p className="text-gray-300 break-all">{name}</p>
            </div>
            {imgSize.w > 0 && (
              <>
                <div>
                  <p className="text-gray-500 uppercase text-[9px] tracking-wider mb-1">Dimensiones</p>
                  <p className="text-gray-300">{imgSize.w} × {imgSize.h} px</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[9px] tracking-wider mb-1">Zoom</p>
                  <p className="text-gray-300">{zoomPercent}%</p>
                </div>
              </>
            )}
          </div>
          {/* Fake PS color swatches */}
          <div className="mt-auto px-3 pb-3">
            <p className="text-gray-500 uppercase text-[9px] tracking-wider mb-2">Color</p>
            <div className="flex gap-1 flex-wrap">
              {["#ff5f56","#ffbd2e","#27c93f","#4a9eff","#bf5af2","#ff6b35"].map((c) => (
                <div key={c} className="w-5 h-5 rounded-sm border border-black/30 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-4 px-3 py-1 bg-[#252525] border-t border-black/40 text-gray-500 text-[10px]">
        <span className="text-gray-400 font-bold">{zoomPercent}%</span>
        {imgSize.w > 0 && <span>{imgSize.w} × {imgSize.h} px</span>}
        <span className="ml-auto truncate max-w-48 text-gray-600">{name}</span>
      </div>
    </div>
  );
}

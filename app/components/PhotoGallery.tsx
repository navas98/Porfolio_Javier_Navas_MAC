import { useState } from "react";

// Añade aquí los nombres de tus imágenes en public/fotos/
// Ejemplo: ["foto1.jpg", "foto2.png", "vacaciones.jpg"]
const FOTOS: string[] = [
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.JPG",
];

interface PhotoGalleryProps {
  onOpenPhoto: (foto: string) => void;
}

export default function PhotoGallery({ onOpenPhoto }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (FOTOS.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#111] text-gray-500 font-mono text-sm gap-3">
        <span className="text-5xl">📷</span>
        <p className="text-gray-400">No hay fotos todavía</p>
        <p className="text-xs text-gray-600 text-center px-8">
          Añade tus imágenes en <span className="text-gray-400">public/fotos/</span> y
          regístralas en <span className="text-gray-400">PhotoGallery.tsx</span>
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#111]">
      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-2">
          {FOTOS.map((foto) => (
            <button
              key={foto}
              onClick={() => setSelected(foto)}
              onDoubleClick={() => onOpenPhoto(foto)}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selected === foto
                  ? "border-blue-500"
                  : "border-transparent hover:border-white/20"
              }`}
            >
              <img
                src={`/fotos/${foto}`}
                alt={foto}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        {selected && (
          <p className="mt-3 text-center text-xs text-gray-600 font-mono">
            Doble clic para abrir en el visor
          </p>
        )}
      </div>

      {/* Preview panel */}
      {selected && (
        <div className="w-56 shrink-0 border-l border-white/10 flex flex-col bg-[#1a1a1a]">
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={`/fotos/${selected}`}
              alt={selected}
              className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
            />
          </div>
          <div className="p-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-gray-400 font-mono truncate">{selected}</p>
            <button
              onClick={() => onOpenPhoto(selected)}
              className="w-full py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-mono transition-colors"
            >
              Abrir en visor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

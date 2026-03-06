import { useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import Window from "./Window";
import FolderIcon from "./FolderIcon";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import Terminal from "./Terminal";
import PhotoGallery from "./PhotoGallery";
import PhotoViewer from "./PhotoViewer";
import Calendar from "./Calendar";
import { textos } from "../textos";
import type { NfqEventRaw } from "../lib/mongodb.server";

// ─── Types ────────────────────────────────────────────────────────────────────

type WinId = "terminal" | "proyectos" | "experiencia" | "estudios" | "fotos" | "calendario";
type OpenDocFn = (title: string, content: ReactNode) => void;

interface WinState {
  id: WinId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  defaultPosition: { x: number; y: number };
  width: number;
  height: number;
}

interface DynWin {
  id: string;
  title: string;
  content: ReactNode;
  isMinimized: boolean;
  zIndex: number;
  defaultPosition: { x: number; y: number };
}

// ─── Document views ───────────────────────────────────────────────────────────

type Proyecto = typeof textos.terminal.proyectos[number];
type Trabajo  = typeof textos.terminal.trabajos[number];
type Estudio  = typeof textos.terminal.estudios[number];

function DocView({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-auto bg-[#111111] font-mono text-sm p-6 leading-relaxed">
      {children}
    </div>
  );
}

function ProyectoDoc({ p }: { p: Proyecto }) {
  return (
    <DocView>
      <p className="text-yellow-400 font-bold text-base mb-0.5">{p.name}</p>
      <p className="text-gray-500 text-xs mb-4">~/proyectos/{p.slug}.txt</p>
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-gray-300">{p.description}</p>
        </div>
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-2">Tecnologías</p>
          <div className="flex gap-2 flex-wrap">
            {p.tech.map((t) => (
              <span key={t} className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded text-xs">{t}</span>
            ))}
          </div>
        </div>
        {p.url && (
          <div>
            <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">URL</p>
            <a href={p.url} target="_blank" rel="noopener noreferrer"
              className="text-cyan-400 underline hover:text-cyan-300 break-all"
              onClick={(e) => e.stopPropagation()}
            >{p.url}</a>
          </div>
        )}
      </div>
    </DocView>
  );
}

function TrabajoDoc({ t }: { t: Trabajo }) {
  return (
    <DocView>
      <p className="text-yellow-400 font-bold text-base mb-0.5">{t.empresa}</p>
      <p className="text-gray-500 text-xs mb-4">~/trabajos/{t.slug}.txt</p>
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Rol</p>
          <p className="text-gray-300">{t.rol}</p>
        </div>
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Período</p>
          <p className="text-gray-300">{t.periodo}</p>
        </div>
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-gray-300">{t.descripcion}</p>
        </div>
        {(t as { proyectos?: string }).proyectos && (
          <div>
            <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Proyectos</p>
            <p className="text-gray-500">{(t as { proyectos?: string }).proyectos}</p>
          </div>
        )}
      </div>
    </DocView>
  );
}

function EstudioDoc({ e }: { e: Estudio }) {
  return (
    <DocView>
      <p className="text-green-400 font-bold text-base mb-0.5">{e.titulo}</p>
      <p className="text-gray-500 text-xs mb-4">~/estudios/{e.slug}.txt</p>
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Período</p>
          <p className="text-gray-300">{e.periodo}</p>
        </div>
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-gray-300">{e.centro}</p>
        </div>
      </div>
    </DocView>
  );
}

// ─── Finder-style file icon ───────────────────────────────────────────────────

function TxtFileIcon({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <div
      onDoubleClick={onOpen}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none group w-20"
    >
      <span className="text-5xl group-hover:scale-110 transition-transform duration-150 drop-shadow">📄</span>
      <span className="text-xs text-white text-center group-hover:bg-blue-500/60 px-1 py-0.5 rounded leading-tight break-all">
        {name}.txt
      </span>
    </div>
  );
}

// ─── Finder window layout ─────────────────────────────────────────────────────

type FolderKey = "proyectos" | "trabajos" | "estudios";

// ─── Finder window — navigable between all 3 folders ─────────────────────────

function FinderContent({ initialFolder, onOpenDoc }: {
  initialFolder: FolderKey;
  onOpenDoc: OpenDocFn;
}) {
  const [active, setActive] = useState<FolderKey>(initialFolder);

  const allFolders: { key: FolderKey; label: string; icon: string; items: { name: string; onOpen: () => void }[] }[] = [
    {
      key: "proyectos", label: "proyectos", icon: "📁",
      items: textos.terminal.proyectos.map((p) => ({
        name: p.slug,
        onOpen: () => onOpenDoc(`${p.slug}.txt`, <ProyectoDoc p={p} />),
      })),
    },
    {
      key: "trabajos", label: "trabajos", icon: "💼",
      items: textos.terminal.trabajos.map((t) => ({
        name: t.slug,
        onOpen: () => onOpenDoc(`${t.slug}.txt`, <TrabajoDoc t={t} />),
      })),
    },
    {
      key: "estudios", label: "estudios", icon: "🎓",
      items: textos.terminal.estudios.map((e) => ({
        name: e.slug,
        onOpen: () => onOpenDoc(`${e.slug}.txt`, <EstudioDoc e={e} />),
      })),
    },
  ];

  const current = allFolders.find((f) => f.key === active)!;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-36 shrink-0 bg-[#1a1a1a] border-r border-white/10 p-3 flex flex-col gap-0.5">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Favoritos</p>
        {allFolders.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-xs text-left transition-colors ${
              f.key === active
                ? "bg-blue-500/40 text-white"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{f.icon}</span>
            <span className="truncate font-mono">{f.label}</span>
          </button>
        ))}
      </div>
      {/* Files grid */}
      <div className="flex-1 bg-[#1e1e1e] p-5 overflow-auto">
        <div className="flex flex-wrap gap-5 content-start">
          {current.items.map((item) => (
            <TxtFileIcon key={item.name} name={item.name} onOpen={item.onOpen} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Folder content components ────────────────────────────────────────────────

function ProyectosContent({ onOpenDoc }: { onOpenDoc: OpenDocFn }) {
  return <FinderContent initialFolder="proyectos" onOpenDoc={onOpenDoc} />;
}
function ExperienciaContent({ onOpenDoc }: { onOpenDoc: OpenDocFn }) {
  return <FinderContent initialFolder="trabajos" onOpenDoc={onOpenDoc} />;
}
function EstudiosContent({ onOpenDoc }: { onOpenDoc: OpenDocFn }) {
  return <FinderContent initialFolder="estudios" onOpenDoc={onOpenDoc} />;
}

// ─── Initial windows ──────────────────────────────────────────────────────────

const INITIAL_WINDOWS: WinState[] = [
  {
    id: "terminal",
    title: "visitor@javier.dev — terminal",
    isOpen: true,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 140, y: 50 },
    width: 720,
    height: 500,
  },
  {
    id: "proyectos",
    title: "📁  Proyectos",
    isOpen: false,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 160, y: 50 },
    width: 640,
    height: 400,
  },
  {
    id: "experiencia",
    title: "💼  Experiencia",
    isOpen: false,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 180, y: 60 },
    width: 580,
    height: 360,
  },
  {
    id: "estudios",
    title: "🎓  Estudios",
    isOpen: false,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 170, y: 55 },
    width: 540,
    height: 320,
  },
  {
    id: "fotos",
    title: "📷  Fotos",
    isOpen: false,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 190, y: 60 },
    width: 700,
    height: 480,
  },
  {
    id: "calendario",
    title: "📅  Calendario",
    isOpen: false,
    isMinimized: false,
    zIndex: 10,
    defaultPosition: { x: 150, y: 45 },
    width: 820,
    height: 520,
  },
];

// ─── Desktop ─────────────────────────────────────────────────────────────────

export default function Desktop({ nfqEvents = [] }: { nfqEvents?: NfqEventRaw[] }) {
  const [windows, setWindows]       = useState<WinState[]>(INITIAL_WINDOWS);
  const [dynWindows, setDynWindows] = useState<DynWin[]>([]);
  const topZRef = useRef(10);

  // ── Static window ops ────────────────────────────────────────────────────

  const bringToFront = useCallback((id: WinId) => {
    topZRef.current += 1;
    const z = topZRef.current;
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, zIndex: z } : w));
  }, []);

  const openWindow = useCallback((id: WinId) => {
    topZRef.current += 1;
    const z = topZRef.current;
    setWindows((ws) =>
      ws.map((w) => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: z } : w)
    );
  }, []);

  const closeWindow = useCallback((id: WinId) => {
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, isOpen: false, isMinimized: false } : w));
  }, []);

  const minimizeWindow = useCallback((id: WinId) => {
    setWindows((ws) => ws.map((w) => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  // ── Dynamic document window ops ──────────────────────────────────────────

  const openDoc = useCallback((title: string, content: ReactNode) => {
    topZRef.current += 1;
    const z = topZRef.current;
    const id = `doc-${Date.now()}`;
    const offset = (topZRef.current % 6) * 18;
    setDynWindows((ws) => [...ws, {
      id, title, content,
      isMinimized: false,
      zIndex: z,
      defaultPosition: { x: 260 + offset, y: 50 + offset },
    }]);
  }, []);

  const closeDynWin = useCallback((id: string) => {
    setDynWindows((ws) => ws.filter((w) => w.id !== id));
  }, []);

  const focusDynWin = useCallback((id: string) => {
    topZRef.current += 1;
    const z = topZRef.current;
    setDynWindows((ws) => ws.map((w) => w.id === id ? { ...w, zIndex: z } : w));
  }, []);

  const minimizeDynWin = useCallback((id: string) => {
    setDynWindows((ws) => ws.map((w) => w.id === id ? { ...w, isMinimized: true } : w));
  }, []);

  // ── Content resolver ─────────────────────────────────────────────────────

  function getContent(id: WinId): ReactNode {
    switch (id) {
      case "terminal":     return <Terminal embedded />;
      case "proyectos":   return <ProyectosContent onOpenDoc={openDoc} />;
      case "experiencia": return <ExperienciaContent onOpenDoc={openDoc} />;
      case "estudios":    return <EstudiosContent onOpenDoc={openDoc} />;
      case "fotos":       return <PhotoGallery onOpenPhoto={(foto) => openDoc(foto, <PhotoViewer src={`/fotos/${foto}`} name={foto} />)} />;
      case "calendario":  return <Calendar nfqEvents={nfqEvents} />;
    }
  }

  // ── Folders + Dock ───────────────────────────────────────────────────────

  const folders = [
    { id: "proyectos"   as WinId, label: "Proyectos",   icon: "📁" },
    { id: "experiencia" as WinId, label: "Experiencia", icon: "💼" },
    { id: "estudios"    as WinId, label: "Estudios",    icon: "🎓" },
    { id: "fotos"       as WinId, label: "Fotos",       icon: "📷" },
  ];

  const dockItems = [
    { id: "terminal",    icon: "🖥️", label: "Terminal",    onClick: () => openWindow("terminal"),    isOpen: windows.find((w) => w.id === "terminal")?.isOpen },
    { id: "proyectos",  icon: "📁",  label: "Proyectos",   onClick: () => openWindow("proyectos"),   isOpen: windows.find((w) => w.id === "proyectos")?.isOpen },
    { id: "experiencia",icon: "💼",  label: "Experiencia", onClick: () => openWindow("experiencia"), isOpen: windows.find((w) => w.id === "experiencia")?.isOpen },
    { id: "estudios",   icon: "🎓",  label: "Estudios",    onClick: () => openWindow("estudios"),    isOpen: windows.find((w) => w.id === "estudios")?.isOpen },
    { id: "fotos",      icon: "📷",  label: "Fotos",       onClick: () => openWindow("fotos"),       isOpen: windows.find((w) => w.id === "fotos")?.isOpen },
    { id: "calendario", icon: "📅",  label: "Calendario",  onClick: () => openWindow("calendario"),  isOpen: windows.find((w) => w.id === "calendario")?.isOpen },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <MenuBar />

      {/* Desktop area */}
      <div className="absolute top-7 left-0 right-0 bottom-20 overflow-hidden">

        {/* Folder icons */}
        <div className="absolute top-4 left-6 flex flex-col gap-5">
          {folders.map((f) => (
            <FolderIcon key={f.id} label={f.label} icon={f.icon} onOpen={() => openWindow(f.id)} />
          ))}
        </div>

        {/* Static windows */}
        {windows.filter((w) => w.isOpen).map((w) => (
          <Window
            key={w.id}
            title={w.title}
            onClose={() => closeWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
            onFocus={() => bringToFront(w.id)}
            zIndex={w.zIndex}
            defaultPosition={w.defaultPosition}
            width={w.width}
            height={w.height}
            isMinimized={w.isMinimized}
          >
            {getContent(w.id)}
          </Window>
        ))}

        {/* Dynamic document windows */}
        {dynWindows.map((w) => (
          <Window
            key={w.id}
            title={w.title}
            onClose={() => closeDynWin(w.id)}
            onMinimize={() => minimizeDynWin(w.id)}
            onFocus={() => focusDynWin(w.id)}
            zIndex={w.zIndex}
            defaultPosition={w.defaultPosition}
            width={480}
            height={420}
            isMinimized={w.isMinimized}
          >
            {w.content}
          </Window>
        ))}
      </div>

      <Dock items={dockItems} />
    </div>
  );
}

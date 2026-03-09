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
import { textos, automataRepo } from "../textos";
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

// ─── Gantt chart ─────────────────────────────────────────────────────────────

type GanttTask = { name: string; start: number; end: number; color: string };
type GanttRow  = { pc: string; label: string; tasks: GanttTask[] };

const GANTT_ROWS: GanttRow[] = [
  {
    pc: "PC 1", label: "n8n / Notion",
    tasks: [
      { name: "n8n activa", start: 6, end: 6.25, color: "#3b82f6" },
      { name: "Lee tareas · Genera hoja de ruta", start: 6.25, end: 8.5, color: "#8b5cf6" },
      { name: "✋ Verificación humana", start: 8.5, end: 9, color: "#eab308" },
    ],
  },
  {
    pc: "PC 1", label: "Coding — Ollama",
    tasks: [{ name: "Ollama + Qwen 32B → Git", start: 9, end: 18, color: "#22c55e" }],
  },
  {
    pc: "PC 1", label: "Cierre del día",
    tasks: [
      { name: "Recopila info", start: 18, end: 20, color: "#f97316" },
      { name: "Informe Notion · Power BI", start: 20, end: 22, color: "#ec4899" },
      { name: "Sube a YouTube", start: 22, end: 23, color: "#f43f5e" },
    ],
  },
  {
    pc: "PC 2", label: "Tests continuos",
    tasks: [{ name: "Escucha pushes → lanza tests", start: 9, end: 18, color: "#14b8a6" }],
  },
  {
    pc: "PC 2", label: "API miniaturas",
    tasks: [{ name: "Genera miniaturas → YouTube", start: 21.5, end: 23, color: "#6366f1" }],
  },
];

const TIME_COLS = [
  { label: "06h – 08h", start: 6,  end: 8  },
  { label: "08h – 09h", start: 8,  end: 9  },
  { label: "09h – 12h", start: 9,  end: 12 },
  { label: "12h – 15h", start: 12, end: 15 },
  { label: "15h – 18h", start: 15, end: 18 },
  { label: "18h – 20h", start: 18, end: 20 },
  { label: "20h – 22h", start: 20, end: 22 },
  { label: "22h – 23h", start: 22, end: 23 },
];


function GanttDoc() {
  const HEADER_BG  = "#2d3561";
  const INACTIVE   = "#1a1b26";
  const CELL_BORDER = "rgba(255,255,255,0.07)";

  const renderTable = (
    rows: GanttRow[],
    cols: typeof TIME_COLS,
  ) => {
    const sectionBg = HEADER_BG;
    return (
      <table className="w-full border-collapse text-[10px]" style={{ borderSpacing: 0 }}>
        <thead>
          <tr>
            <th
              className="font-bold text-white text-left pl-4 py-2.5 text-[10px] tracking-widest uppercase"
              style={{ backgroundColor: sectionBg, border: `1px solid ${CELL_BORDER}`, minWidth: 130 }}
            >
              Tarea
            </th>
            {cols.map((col) => (
              <th
                key={col.label}
                className="font-bold text-white text-center py-2.5 px-1 text-[9px] tracking-wide uppercase whitespace-nowrap"
                style={{ backgroundColor: sectionBg, border: `1px solid ${CELL_BORDER}` }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const prevPc  = ri > 0 ? rows[ri - 1].pc : null;
            const isPC1   = row.pc.startsWith("PC 1");
            const pcColor = isPC1 ? "#3b5bdb" : "#0f9e8e";

            return (
              <>
                {row.pc !== prevPc && (
                  <tr key={`pc-${row.pc}-${ri}`}>
                    <td
                      colSpan={cols.length + 1}
                      className="py-1.5 pl-4 text-[9px] font-bold tracking-[0.2em] uppercase"
                      style={{
                        backgroundColor: pcColor + "22",
                        color: pcColor,
                        border: `1px solid ${CELL_BORDER}`,
                        borderLeft: `3px solid ${pcColor}`,
                      }}
                    >
                      {row.pc}
                    </td>
                  </tr>
                )}
                <tr key={ri}>
                  <td
                    className="py-2.5 pl-4 pr-2 font-semibold text-white text-[10px] whitespace-nowrap"
                    style={{ backgroundColor: sectionBg + "cc", border: `1px solid ${CELL_BORDER}` }}
                  >
                    {row.label}
                  </td>
                  {cols.map((col) => {
                    const activeTask = row.tasks.find((t: GanttTask) => t.start < col.end && t.end > col.start) ?? null;
                    const color = activeTask?.color ?? null;
                    return (
                      <td
                        key={col.label}
                        className="py-2 px-2 align-middle"
                        style={{
                          backgroundColor: color ? color + "55" : INACTIVE,
                          border: `1px solid ${CELL_BORDER}`,
                          boxShadow: color ? `inset 0 0 0 1px ${color}60` : "none",
                        }}
                      >
                        {activeTask && (
                          <span
                            className="text-[9px] font-black tracking-wide uppercase text-center block whitespace-nowrap overflow-hidden"
                            style={{ color: "#ffffff", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                          >
                            {activeTask!.name}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="h-full overflow-auto bg-[#13141f] font-sans text-xs flex flex-col">

      {/* Title header */}
      <div style={{ backgroundColor: HEADER_BG }} className="px-6 py-4 shrink-0">
        <p className="text-white font-black text-base tracking-widest uppercase text-center">Diagrama de Gantt</p>
        <p className="text-blue-200/70 text-[11px] text-center mt-0.5 font-light tracking-wide">Flujo diario automatizado · Proyecto Automata</p>
      </div>

      <div className="p-5">
        {renderTable(GANTT_ROWS, TIME_COLS)}
      </div>

    </div>
  );
}

// ─── Creador de imágenes ──────────────────────────────────────────────────────

function CreadorImagenesDoc() {
  const [titulo, setTitulo]             = useState("");
  const [tema, setTema]                 = useState("");
  const [estilo, setEstilo]             = useState("General");
  const [completadas, setCompletadas]   = useState("Crear API REST\nConectar base de datos\nEscribir tests unitarios");
  const [pendientes, setPendientes]     = useState("Refactorizar modulo auth\nDeploy a produccion");
  const [color, setColor]               = useState("#ff0000");
  const [pasos, setPasos]               = useState(20);
  const [cfg, setCfg]                   = useState(7);
  const [modelo, setModelo]             = useState("delyrielate_v30.safetensors");
  const [generando, setGenerando]       = useState(false);
  const [generado, setGenerado]         = useState(false);

  const inputCls = "w-full bg-[#0f0f0f] border border-white/10 rounded px-3 py-2 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-white/25";
  const labelCls = "block text-[10px] text-gray-400 mb-1";

  function simularGeneracion() {
    setGenerando(true);
    setGenerado(false);
    setTimeout(() => { setGenerando(false); setGenerado(true); }, 2500);
  }

  return (
    <div className="h-full overflow-auto bg-[#0a0a0a] font-sans text-xs flex flex-col">

      {/* Header */}
      <div className="text-center py-4 border-b border-white/[0.05] shrink-0">
        <p className="text-gray-300 text-[11px] mb-2">Genera miniaturas para YouTube con IA local</p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          ComfyUI conectado
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-4 p-5 min-h-0">

        {/* Left — Configuración */}
        <div className="w-[320px] shrink-0 bg-[#141414] border border-white/[0.07] rounded-lg p-5 overflow-auto">
          <p className="text-white font-bold text-[11px] tracking-widest uppercase mb-4">Configuración</p>

          <div className="space-y-3">
            {/* Título */}
            <div>
              <label className={labelCls}>Título del video <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="Ej: 5 Trucos de Python que NO conocías"
                value={titulo} onChange={e => setTitulo(e.target.value)} />
            </div>

            {/* Tema */}
            <div>
              <label className={labelCls}>Tema o descripción visual</label>
              <textarea className={`${inputCls} resize-none h-20`}
                placeholder={"Ej: programador frente a pantallas con\ncodigo, ambiente futurista"}
                value={tema} onChange={e => setTema(e.target.value)} />
            </div>

            {/* Estilo */}
            <div>
              <label className={labelCls}>Estilo</label>
              <select className={inputCls} value={estilo} onChange={e => setEstilo(e.target.value)}>
                {["General","Futurista","Minimalista","Dramático","Corporativo"].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Tareas completadas */}
            <div>
              <label className={labelCls}>
                <span className="text-green-400">✓ Tareas completadas</span>
                <span className="text-gray-600 ml-1">(una por línea)</span>
              </label>
              <textarea
                className="w-full bg-[#0f0f0f] border border-green-500/20 rounded px-3 py-2 text-green-300 text-[10px] font-mono placeholder-gray-700 focus:outline-none focus:border-green-500/40 resize-none h-24"
                value={completadas} onChange={e => setCompletadas(e.target.value)} />
            </div>

            {/* Tareas pendientes */}
            <div>
              <label className={labelCls}>
                <span className="text-red-400">✗ Tareas pendientes</span>
                <span className="text-gray-600 ml-1">(una por línea)</span>
              </label>
              <textarea
                className="w-full bg-[#0f0f0f] border border-red-500/20 rounded px-3 py-2 text-red-300 text-[10px] font-mono placeholder-gray-700 focus:outline-none focus:border-red-500/40 resize-none h-24"
                value={pendientes} onChange={e => setPendientes(e.target.value)} />
            </div>

            {/* Color principal */}
            <div>
              <label className={labelCls}>Color principal</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer border border-white/10 bg-transparent p-0.5" />
                <input className={`${inputCls} flex-1`} value={color}
                  onChange={e => setColor(e.target.value)} />
              </div>
            </div>

            {/* Pasos + CFG */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelCls}>Pasos (calidad)</label>
                <input type="number" className={inputCls} value={pasos}
                  onChange={e => setPasos(Number(e.target.value))} min={1} max={150} />
              </div>
              <div className="flex-1">
                <label className={labelCls}>CFG Scale</label>
                <input type="number" className={inputCls} value={cfg}
                  onChange={e => setCfg(Number(e.target.value))} min={1} max={20} />
              </div>
            </div>

            {/* Modelo */}
            <div>
              <label className={labelCls}>Modelo</label>
              <select className={inputCls} value={modelo} onChange={e => setModelo(e.target.value)}>
                {["delyrielate_v30.safetensors","dreamshaper_8.safetensors","realisticVision_v5.safetensors"].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Botón */}
            <button
              onClick={simularGeneracion}
              disabled={generando}
              className="w-full py-2.5 rounded font-bold text-white text-xs tracking-wide uppercase transition-opacity disabled:opacity-60"
              style={{ backgroundColor: color }}
            >
              {generando ? "Generando…" : "Generar Miniatura"}
            </button>
          </div>
        </div>

        {/* Right — Vista previa */}
        <div className="flex-1 bg-[#141414] border border-white/[0.07] rounded-lg p-5 flex flex-col">
          <p className="text-white font-bold text-[11px] tracking-widest uppercase mb-4">Vista Previa</p>
          <div className="flex-1 bg-[#0f0f0f] rounded-lg border border-white/[0.05] flex items-center justify-center relative overflow-hidden">
            {generando && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-gray-500 text-[10px]">Generando con ComfyUI…</p>
              </div>
            )}
            {!generando && !generado && (
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
                  <path d="M21 15l-5-5L5 21" strokeWidth="1.5"/>
                </svg>
                <p className="text-[11px]">La miniatura aparecerá aquí</p>
                <p className="text-[10px] text-gray-700">1280 x 720 px</p>
              </div>
            )}
            {!generando && generado && (
              <img
                src="/generador_imagenes/miniatura_youtube.jpg"
                alt="Miniatura generada"
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>
          {generado && (
            <div className="mt-3 flex gap-2">
              <button className="flex-1 py-2 rounded border border-white/10 text-gray-300 text-[10px] hover:bg-white/5 transition-colors">
                Descargar PNG
              </button>
              <button className="flex-1 py-2 rounded border border-white/10 text-gray-300 text-[10px] hover:bg-white/5 transition-colors"
                onClick={() => setGenerado(false)}>
                Nueva generación
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Automata Git page ───────────────────────────────────────────────────────

function AutomataGitDoc() {
  const r = automataRepo;
  const [tab, setTab] = useState<"readme" | "commits" | "estado">("readme");

  const BG       = "#0d1117";
  const PANEL    = "#161b22";
  const BORDER   = "rgba(48,54,61,1)";
  const MUTED    = "#8b949e";
  const ACCENT   = "#58a6ff";
  const GREEN    = "#3fb950";

  const tabCls = (t: typeof tab) =>
    `px-3 py-2 text-xs border-b-2 transition-colors cursor-pointer ${
      tab === t
        ? "border-[#f78166] text-white"
        : "border-transparent text-[#8b949e] hover:text-white"
    }`;

  return (
    <div className="h-full overflow-auto font-mono text-xs" style={{ backgroundColor: BG, color: "#e6edf3" }}>

      {/* Repo header */}
      <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: MUTED }}>🔒</span>
          <span style={{ color: ACCENT }} className="font-semibold text-sm">
            {r.fullName}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-sans" style={{ color: MUTED, borderColor: BORDER }}>
            Private
          </span>
        </div>
        <p className="text-[11px] font-sans mb-3" style={{ color: MUTED }}>{r.description}</p>
        <div className="flex items-center gap-4 text-[10px] font-sans" style={{ color: MUTED }}>
          <span>⑂ {r.commits.length} commits</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: GREEN }} />
            {r.branch}
          </span>
          <span>Actualizado {r.updatedAt}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 border-b" style={{ borderColor: BORDER }}>
        {(["readme","commits","estado"] as const).map(t => (
          <button key={t} className={tabCls(t)} onClick={() => setTab(t)}>
            {{ readme: "📄 README", commits: "🕐 Commits", estado: "✅ Estado" }[t]}
          </button>
        ))}
      </div>

      <div className="px-6 py-5">

        {/* ── README ── */}
        {tab === "readme" && (
          <div className="space-y-6 font-sans max-w-3xl">

            {/* Idea */}
            <section>
              <h2 className="text-sm font-bold text-white mb-2">💡 Idea general</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: "#e6edf3" }}>{r.readme.idea}</p>
            </section>

            {/* Hardware */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">🖥 Hardware</h2>
              <div className="grid grid-cols-2 gap-3">
                {[r.readme.hardware.pc1, r.readme.hardware.pc2].map((pc, i) => (
                  <div key={i} className="rounded-lg p-3 border text-[10px]" style={{ backgroundColor: PANEL, borderColor: BORDER }}>
                    <p className="font-bold text-white mb-1">PC {i + 1}{i === 0 ? " — Programador" : " — Tester"}</p>
                    <p className="font-mono text-[9px] mb-1" style={{ color: ACCENT }}>{pc.nombre}</p>
                    <p style={{ color: MUTED }}>{pc.rol}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Stack */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">⚙ Stack tecnológico</h2>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: BORDER }}>
                {r.readme.stack.map((s, i) => (
                  <div key={i} className="flex text-[10px] border-b last:border-b-0" style={{ borderColor: BORDER, backgroundColor: i % 2 === 0 ? PANEL : BG }}>
                    <span className="w-40 shrink-0 px-3 py-2 font-semibold" style={{ color: MUTED }}>{s.clave}</span>
                    <span className="px-3 py-2" style={{ color: "#e6edf3" }}>{s.valor}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Comparativa hardware */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">📊 Comparativa hardware</h2>
              <div className="rounded-lg border overflow-hidden text-[10px]" style={{ borderColor: BORDER }}>
                <div className="grid grid-cols-4 px-3 py-1.5 font-bold" style={{ backgroundColor: "#1c2128", color: MUTED }}>
                  <span>Máquina</span><span>RAM</span><span>Precio</span><span>Veredicto</span>
                </div>
                {r.readme.hardwareComparativa.map((h, i) => (
                  <div key={i} className="grid grid-cols-4 px-3 py-2 border-t items-center" style={{ borderColor: BORDER, backgroundColor: h.elegido ? "#1a2f1a" : (i % 2 === 0 ? PANEL : BG) }}>
                    <span className={h.elegido ? "font-bold text-white" : ""} style={{ color: "#e6edf3" }}>{h.maquina}</span>
                    <span style={{ color: ACCENT }}>{h.ram}</span>
                    <span style={{ color: MUTED }}>{h.precio}</span>
                    <span style={{ color: h.elegido ? GREEN : MUTED }}>
                      {h.elegido ? "★ " : ""}{h.veredicto}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Comparativa modelo */}
            <section>
              <h2 className="text-sm font-bold text-white mb-3">🤖 Comparativa modelo IA</h2>
              <div className="rounded-lg border overflow-hidden text-[10px]" style={{ borderColor: BORDER }}>
                <div className="grid grid-cols-5 px-3 py-1.5 font-bold" style={{ backgroundColor: "#1c2128", color: MUTED }}>
                  <span className="col-span-2">Modelo</span><span>RAM Q4</span><span>SWE-bench</span><span>Velocidad</span>
                </div>
                {r.readme.modeloComparativa.map((m, i) => (
                  <div key={i} className="grid grid-cols-5 px-3 py-2 border-t items-center" style={{ borderColor: BORDER, backgroundColor: m.elegido ? "#1a2f1a" : (i % 2 === 0 ? PANEL : BG) }}>
                    <span className="col-span-2 font-bold" style={{ color: m.elegido ? "#ffffff" : "#e6edf3" }}>{m.elegido ? "★ " : ""}{m.modelo}</span>
                    <span style={{ color: ACCENT }}>{m.ram}</span>
                    <span style={{ color: m.elegido ? GREEN : MUTED }}>{m.swe}</span>
                    <span style={{ color: MUTED }}>{m.velocidad}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── COMMITS ── */}
        {tab === "commits" && (
          <div className="space-y-1 max-w-2xl">
            {r.commits.map((c) => (
              <div key={c.sha} className="flex items-center gap-3 px-3 py-2.5 rounded border text-[11px] font-sans" style={{ backgroundColor: PANEL, borderColor: BORDER }}>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "#1c2128", color: ACCENT }}>{c.sha}</span>
                <span className="flex-1" style={{ color: "#e6edf3" }}>{c.message}</span>
                <span className="text-[9px] shrink-0" style={{ color: MUTED }}>{c.date}</span>
                {c.verified && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded border" style={{ color: GREEN, borderColor: "#238636" }}>Verified</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ESTADO ── */}
        {tab === "estado" && (
          <div className="max-w-lg font-sans">
            <h2 className="text-sm font-bold text-white mb-3">Lista de tareas</h2>
            <div className="space-y-1">
              {r.readme.estado.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded border text-[11px]" style={{ backgroundColor: PANEL, borderColor: BORDER }}>
                  <span style={{ color: e.hecho ? GREEN : MUTED }}>{e.hecho ? "✓" : "○"}</span>
                  <span style={{ color: e.hecho ? "#e6edf3" : MUTED, textDecoration: e.hecho ? "line-through" : "none" }}>{e.tarea}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-4" style={{ color: MUTED }}>
              {r.readme.estado.filter(e => e.hecho).length} / {r.readme.estado.length} completadas
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Personal file doc ────────────────────────────────────────────────────────

type PersonalFile = { slug: string; name: string; ext: string; description: string; tech: string[] };

function PersonalFileDoc({ f }: { f: PersonalFile }) {
  const extIcons: Record<string, string> = { gantt: "📊", git: "🔧", html: "🌐", md: "📝" };
  return (
    <DocView>
      <p className="text-yellow-400 font-bold text-base mb-0.5">{f.name}.{f.ext}</p>
      <p className="text-gray-500 text-xs mb-4">~/proyectos/Proyecto_Personal/{f.name}.{f.ext}</p>
      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <p className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Descripción</p>
          <p className="text-gray-300">{f.description || "—"}</p>
        </div>
        {f.tech.length > 0 && (
          <div>
            <p className="text-cyan-400 text-xs uppercase tracking-wider mb-2">Tecnologías</p>
            <div className="flex gap-2 flex-wrap">
              {f.tech.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded text-xs">{t}</span>
              ))}
            </div>
          </div>
        )}
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

const EXT_ICONS: Record<string, string> = { gantt: "📊", git: "🔧", html: "🌐", md: "📝" };

function ExtFileIcon({ name, ext, onOpen }: { name: string; ext: string; onOpen: () => void }) {
  return (
    <div
      onDoubleClick={onOpen}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none group w-20"
    >
      <span className="text-5xl group-hover:scale-110 transition-transform duration-150 drop-shadow">
        {EXT_ICONS[ext] ?? "📄"}
      </span>
      <span className="text-xs text-white text-center group-hover:bg-blue-500/60 px-1 py-0.5 rounded leading-tight break-all">
        {name}.{ext}
      </span>
    </div>
  );
}

function FolderFileIcon({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <div
      onDoubleClick={onOpen}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none group w-20"
    >
      <span className="text-5xl group-hover:scale-110 transition-transform duration-150 drop-shadow">📁</span>
      <span className="text-xs text-white text-center group-hover:bg-blue-500/60 px-1 py-0.5 rounded leading-tight break-all">
        {name}
      </span>
    </div>
  );
}

// ─── Finder window layout ─────────────────────────────────────────────────────

type FolderKey = "proyectos" | "trabajos" | "estudios";

// ─── Finder window — navigable between all 3 folders ─────────────────────────

type SubFolder = { name: string; files: PersonalFile[] };

function FinderContent({ initialFolder, onOpenDoc }: {
  initialFolder: FolderKey;
  onOpenDoc: OpenDocFn;
}) {
  const [active, setActive] = useState<FolderKey>(initialFolder);
  const [subFolder, setSubFolder] = useState<SubFolder | null>(null);

  const allFolders: { key: FolderKey; label: string; icon: string; items: { name: string; type?: string; files?: PersonalFile[]; onOpen: () => void }[] }[] = [
    {
      key: "proyectos", label: "proyectos", icon: "📁",
      items: textos.terminal.proyectos.map((p) => ({
        name: p.slug,
        type: (p as any).type,
        files: (p as any).files,
        onOpen: () => {
          if ((p as any).type === "folder") {
            setSubFolder({ name: p.slug, files: (p as any).files ?? [] });
          } else {
            onOpenDoc(`${p.slug}.txt`, <ProyectoDoc p={p} />);
          }
        },
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
            onClick={() => { setActive(f.key); setSubFolder(null); }}
            className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-xs text-left transition-colors ${
              f.key === active && !subFolder
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
      <div className="flex-1 bg-[#1e1e1e] overflow-auto">
        {subFolder ? (
          <>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <button
                onClick={() => setSubFolder(null)}
                className="text-gray-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                ← atrás
              </button>
              <span className="text-gray-500 text-xs font-mono">proyectos / {subFolder.name}</span>
            </div>
            <div className="p-5 flex flex-wrap gap-5 content-start">
              {subFolder.files.map((f) => (
                <ExtFileIcon
                  key={f.slug}
                  name={f.name}
                  ext={f.ext}
                  onOpen={() => {
                    const content = f.ext === "gantt" ? <GanttDoc />
                      : f.ext === "html" ? <CreadorImagenesDoc />
                      : f.ext === "git"  ? <AutomataGitDoc />
                      : <PersonalFileDoc f={f} />;
                    onOpenDoc(`${f.name}.${f.ext}`, content);
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-5 flex flex-wrap gap-5 content-start">
            {current.items.map((item) =>
              item.type === "folder" ? (
                <FolderFileIcon key={item.name} name={item.name} onOpen={item.onOpen} />
              ) : (
                <TxtFileIcon key={item.name} name={item.name} onOpen={item.onOpen} />
              )
            )}
          </div>
        )}
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

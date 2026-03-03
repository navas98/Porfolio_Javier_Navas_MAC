import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { textos } from "../textos";

// ─── Types ───────────────────────────────────────────────────────────────────

type Color = "green" | "cyan" | "yellow" | "red" | "white" | "gray";

type Line =
  | { id: number; type: "ascii" }
  | { id: number; type: "blank" }
  | { id: number; type: "command"; prompt: string; cmd: string }
  | { id: number; type: "text"; text: string; color?: Color }
  | { id: number; type: "link"; label: string; url: string };

// Omit distribuido sobre la unión (el Omit estándar no distribuye)
type LineInput = Line extends { id: number } & infer R ? R : never;

// ─── ASCII art ───────────────────────────────────────────────────────────────

const ASCII = `     ██╗ █████╗ ██╗   ██╗██╗███████╗██████╗
     ██║██╔══██╗██║   ██║██║██╔════╝██╔══██╗
     ██║███████║██║   ██║██║█████╗  ██████╔╝
██   ██║██╔══██║╚██╗ ██╔╝██║██╔══╝  ██╔══██╗
╚█████╔╝██║  ██║ ╚████╔╝ ██║███████╗██║  ██║
 ╚════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝╚═╝  ╚═╝

███╗   ██╗ █████╗ ██╗   ██╗ █████╗ ███████╗
████╗  ██║██╔══██╗██║   ██║██╔══██╗██╔════╝
██╔██╗ ██║███████║██║   ██║███████║███████╗
██║╚██╗██║██╔══██║╚██╗ ██╔╝██╔══██║╚════██║
██║ ╚████║██║  ██║ ╚████╔╝ ██║  ██║███████║
╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

let uid = 0;
const nextId = () => ++uid;

const SEP = "─────────────────────────────────────────────────";

const BOOT: Line[] = [
  { id: nextId(), type: "ascii" },
  { id: nextId(), type: "blank" },
  { id: nextId(), type: "text", text: "Bienvenido al portfolio de Javier Navas.  (v1.0.0)", color: "white" },
  { id: nextId(), type: "text", text: SEP, color: "gray" },
  { id: nextId(), type: "text", text: "Escribe `help` para ver los comandos disponibles.", color: "gray" },
  { id: nextId(), type: "blank" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(BOOT);
  const [input, setInput] = useState("");
  const [path, setPath] = useState("~");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { prompt: host } = textos.terminal;
  const promptStr = `${host}:${path}$`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // ── Line factory ───────────────────────────────────────────────────────────

  function push(...newLines: Omit<Line, "id">[]) {
    setLines((prev) => [
      ...prev,
      ...newLines.map((l) => ({ ...l, id: nextId() } as Line)),
    ]);
  }

  // ── Valid paths ────────────────────────────────────────────────────────────

  function isValidPath(p: string) {
    const { proyectos, estudios, trabajos } = textos.terminal;
    const valid = new Set([
      "~",
      "~/proyectos",
      "~/estudios",
      "~/trabajos",
      ...proyectos.map((x) => `~/proyectos/${x.slug}`),
      ...estudios.map((x) => `~/estudios/${x.slug}`),
      ...trabajos.map((x) => `~/trabajos/${x.slug}`),
    ]);
    return valid.has(p);
  }

  // ── Command runner ─────────────────────────────────────────────────────────

  function execute(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;

    push({ type: "command", prompt: promptStr, cmd });
    setCmdHistory((h) => [cmd, ...h]);
    setHistoryIdx(-1);

    const [command, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    switch (command.toLowerCase()) {
      case "help":       cmdHelp();              break;
      case "whoami":     cmdWhoami();            break;
      case "about":      cmdAbout();             break;
      case "dir":
      case "ls":         cmdDir();               break;
      case "cd":         cmdCd(arg);             break;
      case "ping":       cmdPing(arg);           break;
      case "git":
        arg === "init"
          ? cmdGitInit()
          : push({ type: "text", text: `git: '${arg}' no reconocido`, color: "red" }, { type: "blank" });
        break;
      case "clear":      setLines([...BOOT]);    break;
      case "bot_javier": cmdBot();               break;
      default:
        push(
          { type: "text", text: `bash: ${command}: comando no encontrado`, color: "red" },
          { type: "text", text: "Escribe `help` para ver los comandos disponibles.", color: "gray" },
          { type: "blank" }
        );
    }
  }

  // ── Commands ───────────────────────────────────────────────────────────────

  function cmdHelp() {
    push(
      { type: "blank" },
      { type: "text", text: "Comandos disponibles:", color: "cyan" },
      { type: "text", text: SEP, color: "gray" },
      { type: "text", text: "  about               → Sobre mí", color: "white" },
      { type: "text", text: "  whoami              → Quién soy", color: "white" },
      { type: "text", text: "  dir                 → Listar directorio actual", color: "white" },
      { type: "text", text: "  cd <carpeta>        → Entrar en una carpeta", color: "white" },
      { type: "text", text: "  cd ..               → Volver atrás", color: "white" },
      { type: "text", text: "  ping <proyecto>     → Info + URL de un proyecto", color: "white" },
      { type: "text", text: "  git init            → Mi cuenta de GitHub", color: "white" },
      { type: "text", text: "  clear               → Limpiar terminal", color: "white" },
      { type: "text", text: "  bot_javier          → Chatbot IA sobre mí  ✦", color: "cyan" },
      { type: "blank" }
    );
  }

  function cmdAbout() {
    const lines = textos.terminal.about;
    push(
      { type: "blank" },
      ...lines.map((text) => ({ type: "text" as const, text, color: "white" as const })),
      { type: "blank" }
    );
  }

  function cmdWhoami() {
    push(
      { type: "blank" },
      { type: "text", text: "Javier Navas · Ingeniero Informático · Desarrollador Full Stack", color: "green" },
      { type: "blank" }
    );
  }

  function cmdDir() {
    const { proyectos, estudios, trabajos } = textos.terminal;

    if (path === "~") {
      push(
        { type: "blank" },
        { type: "text", text: "  proyectos/    estudios/    trabajos/", color: "cyan" },
        { type: "blank" }
      );
      return;
    }

    if (path === "~/proyectos") {
      push(
        { type: "blank" },
        { type: "text", text: "  " + proyectos.map((p) => p.slug + "/").join("    "), color: "cyan" },
        { type: "blank" }
      );
      return;
    }

    if (path.startsWith("~/proyectos/")) {
      const slug = path.slice("~/proyectos/".length);
      const p = proyectos.find((x) => x.slug === slug);
      if (p) {
        push(
          { type: "blank" },
          { type: "text", text: `  ${p.name}`, color: "yellow" },
          { type: "text", text: `  ${p.description}`, color: "white" },
          { type: "text", text: `  Tech:  ${p.tech.join(" · ")}`, color: "red" },
          { type: "link", label: `  URL:   ${p.url}`, url: p.url },
          { type: "blank" }
        );
      }
      return;
    }

    if (path === "~/estudios") {
      push(
        { type: "blank" },
        { type: "text", text: "  " + estudios.map((e) => e.slug + "/").join("    "), color: "cyan" },
        { type: "blank" }
      );
      return;
    }

    if (path.startsWith("~/estudios/")) {
      const slug = path.slice("~/estudios/".length);
      const e = estudios.find((x) => x.slug === slug);
      if (e) {
        push(
          { type: "blank" },
          { type: "text", text: `  ${e.titulo}`, color: "yellow" },
          { type: "text", text: `  ${e.periodo}`, color: "cyan" },
          { type: "text", text: `  ${e.centro}`, color: "blue" },
          
          { type: "blank" }
        );
      }
      return;
    }

    if (path === "~/trabajos") {
      push(
        { type: "blank" },
        { type: "text", text: "  " + trabajos.map((t) => t.slug + "/").join("    "), color: "cyan" },
        { type: "blank" }
      );
      return;
    }

    if (path.startsWith("~/trabajos/")) {
      const slug = path.slice("~/trabajos/".length);
      const t = trabajos.find((x) => x.slug === slug);
      if (t) {
        push(
          { type: "blank" },
          { type: "text", text: `  ${t.empresa}`, color: "yellow" },
          { type: "text", text: `  ${t.rol}`, color: "red" },
          { type: "text", text: `  ${t.periodo}`, color: "cyan" },
          { type: "text", text: `  ${t.descripcion}`, color: "white" },
          { type: "text", text: `  ${t.proyectos}`, color: "gray" },
          { type: "blank" }
        );
      }
    }
  }

  function cmdCd(target: string) {
    if (!target || target === "~") {
      setPath("~");
      push({ type: "blank" });
      return;
    }

    if (target === "..") {
      if (path === "~") {
        push({ type: "text", text: "bash: ya estás en el directorio raíz", color: "yellow" }, { type: "blank" });
        return;
      }
      const segments = path.split("/");
      segments.pop();
      setPath(segments.join("/") || "~");
      push({ type: "blank" });
      return;
    }

    const newPath = path === "~" ? `~/${target}` : `${path}/${target}`;

    if (isValidPath(newPath)) {
      setPath(newPath);
      push({ type: "blank" });
    } else {
      push(
        { type: "text", text: `bash: cd: ${target}: No existe el directorio`, color: "red" },
        { type: "blank" }
      );
    }
  }

  function cmdPing(target: string) {
    if (!target) {
      push(
        { type: "text", text: "uso: ping <slug-proyecto>", color: "yellow" },
        { type: "blank" }
      );
      return;
    }

    const p = textos.terminal.proyectos.find((x) => x.slug === target);
    if (!p) {
      push(
        { type: "text", text: `ping: '${target}': proyecto no encontrado`, color: "red" },
        { type: "text", text: "Usa `cd proyectos` y luego `dir` para ver los disponibles.", color: "gray" },
        { type: "blank" }
      );
      return;
    }

    push(
      { type: "blank" },
      { type: "text", text: "PONG!", color: "green" },
      { type: "text", text: SEP, color: "gray" },
      { type: "text", text: `  Nombre:      ${p.name}`, color: "yellow" },
      { type: "text", text: `  Descripción: ${p.description}`, color: "white" },
      { type: "text", text: `  Tech:        ${p.tech.join(" · ")}`, color: "red" },
      { type: "link", label: `  URL:         ${p.url}`, url: p.url },
      { type: "blank" }
    );
  }

  function cmdGitInit() {
    push(
      { type: "blank" },
      { type: "text", text: "Initialized empty Javier Navas repository in /", color: "green" },
      { type: "text", text: SEP, color: "gray" },
      { type: "text", text: "  remote: github.com/navas98", color: "white" },
      { type: "link", label: "  → https://github.com/navas98", url: "https://github.com/navas98" },
      { type: "blank" }
    );
  }

  function cmdBot() {
    push(
      { type: "blank" },
      { type: "text", text: "Iniciando bot_javier...", color: "cyan" },
      { type: "text", text: "⚠  Próximamente disponible.", color: "yellow" },
      { type: "blank" }
    );
  }

  // ── Tab completion ─────────────────────────────────────────────────────────

  const COMMANDS = ["about", "bot_javier", "cd", "clear", "dir", "git init", "help", "ls", "ping", "whoami"];

  function getSubdirs(currentPath: string): string[] {
    const { proyectos, estudios, trabajos } = textos.terminal;
    if (currentPath === "~")            return ["proyectos", "estudios", "trabajos"];
    if (currentPath === "~/proyectos")  return proyectos.map((p) => p.slug);
    if (currentPath === "~/estudios")   return estudios.map((e) => e.slug);
    if (currentPath === "~/trabajos")   return trabajos.map((t) => t.slug);
    return [];
  }

  function getCompletions(raw: string): string[] {
    const parts = raw.split(/\s+/);

    // Completing a command name
    if (parts.length === 1) {
      const partial = parts[0].toLowerCase();
      return COMMANDS.filter((c) => c.startsWith(partial));
    }

    const command = parts[0].toLowerCase();
    const partial = parts[1] ?? "";

    if (command === "cd") {
      const candidates = [...getSubdirs(path), ".."];
      return candidates.filter((d) => d.startsWith(partial));
    }

    if (command === "ping") {
      return textos.terminal.proyectos
        .map((p) => p.slug)
        .filter((s) => s.startsWith(partial));
    }

    return [];
  }

  function handleTab(e: React.KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    const completions = getCompletions(input);
    if (completions.length === 0) return;

    if (completions.length === 1) {
      // Single match → complete it
      const parts = input.split(/\s+/);
      if (parts.length === 1) {
        setInput(completions[0] + " ");
      } else {
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(" ") + " ");
      }
      return;
    }

    // Multiple matches → echo command + show options
    push(
      { type: "command", prompt: promptStr, cmd: input },
      { type: "text", text: completions.join("    "), color: "cyan" },
      { type: "blank" }
    );
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Tab") {
      handleTab(e);
    } else if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(idx);
      if (cmdHistory[idx] !== undefined) setInput(cmdHistory[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? "" : (cmdHistory[idx] ?? ""));
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen  flex items-center justify-center p-4 md:p-8"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        className="w-full max-w-5xl rounded-xl border border-white/10 shadow-2xl shadow-black/60 flex flex-col overflow-hidden bg-[#111111]"
        style={{ height: "85vh" }}
      >
        {/* ── Title bar ── */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-[#1c1c1c] border-b border-white/5 select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="flex-1 text-center text-xs text-gray-500 font-mono">
            visitor@javier.dev — terminal
          </span>
        </div>

        {/* ── Output area ── */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-sm leading-relaxed">
          {lines.map((line) => (
            <RenderLine key={line.id} line={line} />
          ))}

          {/* Active input line */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-green-400 shrink-0 select-none">{promptStr}</span>
            <span className="text-gray-600 select-none"> </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 bg-transparent text-gray-100 outline-none caret-cyan-400 min-w-0"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              autoFocus
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Line renderer ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  green:  "text-green-400",
  cyan:   "text-cyan-400",
  yellow: "text-yellow-400",
  red:    "text-red-400",
  white:  "text-gray-100",
  gray:   "text-gray-500",
};

function RenderLine({ line }: { line: Line }) {
  if (line.type === "blank") {
    return <div className="h-2" />;
  }

  if (line.type === "ascii") {
    return (
      <pre className="text-cyan-400 text-xs leading-tight overflow-x-auto mb-1 select-none">
        {ASCII}
      </pre>
    );
  }

  if (line.type === "command") {
    return (
      <div className="flex gap-2">
        <span className="text-green-400 shrink-0 select-none">{line.prompt}</span>
        <span className="text-gray-100"> {line.cmd}</span>
      </div>
    );
  }

  if (line.type === "link") {
    return (
      <a
        href={line.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-cyan-400 underline underline-offset-2 hover:text-cyan-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {line.label}
      </a>
    );
  }

  // text
  const cls = line.color ? COLOR_MAP[line.color] : "text-gray-300";
  return <div className={cls}>{line.text}</div>;
}

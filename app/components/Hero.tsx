import { useEffect, useState } from "react";
import { textos } from "../textos";

const { greeting, name, roles, ctas, scroll } = textos.hero;

export default function Hero() {
  const [displayText, setDisplayText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    const current = roles[roleIndex];

    if (!isDeleting && charCount < current.length) {
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charCount + 1));
        setCharCount((c) => c + 1);
      }, 80);
      return () => clearTimeout(t);
    }

    if (!isDeleting && charCount === current.length) {
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    }

    if (isDeleting && charCount > 0) {
      const t = setTimeout(() => {
        setDisplayText(current.slice(0, charCount - 1));
        setCharCount((c) => c - 1);
      }, 40);
      return () => clearTimeout(t);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setRoleIndex((i) => (i + 1) % roles.length);
    }
  }, [charCount, isDeleting, roleIndex]);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background: radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
      </div>

      {/* Background: subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, #334155 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Greeting label */}
        <p className="text-cyan-400 text-lg font-mono tracking-[0.3em] uppercase mb-6 opacity-80">
          {greeting}
        </p>

        {/* Name */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-6 leading-none">
          <span className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            {name}
          </span>
        </h1>

        {/* Typing role */}
        <div className="h-8 sm:h-10 flex items-center justify-center mb-6">
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-mono">
            {displayText}
            <span className="inline-block w-[2px] h-5 ml-[2px] bg-cyan-400 animate-[blink_1s_step-end_infinite] align-middle" />
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Primary */}
          <a
            href="#proyectos"
            className="group px-6 py-3 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-medium transition-all duration-300 hover:bg-cyan-400/20 hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]"
          >
            {ctas.proyectos}
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>

          {/* Secondary */}
          <a
            href={ctas.cvUrl}
            download
            className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
          >
            {ctas.cv}
          </a>

          
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-[10px] tracking-[0.25em] uppercase font-mono">
          {scroll}
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        <div className="w-1 h-1 rounded-full bg-gray-600 animate-bounce" />
      </div>
    </section>
  );
}

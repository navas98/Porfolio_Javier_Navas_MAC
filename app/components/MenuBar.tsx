import { useState, useEffect } from "react";

export default function MenuBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString("es-ES", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-black/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 z-[9999] select-none">
      <div className="flex items-center gap-4 text-white text-xs">
        <span className="text-lg leading-none"></span>
        <span className="font-semibold hover:bg-white/10 px-2 py-0.5 rounded cursor-default transition-colors">
          Javier Navas
        </span>
        <span className="text-white/50 hover:bg-white/10 px-2 py-0.5 rounded cursor-default transition-colors hidden sm:inline">
          Portfolio
        </span>
      </div>
      <div className="flex items-center gap-3 text-white text-xs">
        <span className="text-white/60 hidden sm:inline">{dateStr}</span>
        <span className="font-medium">{timeStr}</span>
      </div>
    </div>
  );
}

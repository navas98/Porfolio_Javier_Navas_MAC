interface DockItem {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  isOpen?: boolean;
}

interface DockProps {
  items: DockItem[];
}

export default function Dock({ items }: DockProps) {
  return (
    <div className="fixed bottom-1 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="flex items-end gap-0.5 px-2 py-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl shadow-black/50">
        {items.map((item, i) => (
          <div key={item.id} className="flex flex-col items-center">
            {i > 0 && i === items.length - 1 && (
              <div className="w-px h-5 bg-white/20 mx-1 self-center" />
            )}
            <button
              onClick={item.onClick}
              title={item.label}
              className="flex flex-col items-center gap-0.5 group px-1"
            >
              <span className="text-2xl drop-shadow-lg group-hover:scale-125 transition-transform duration-200 origin-bottom inline-block">
                {item.icon}
              </span>
              {item.isOpen && (
                <span className="w-1 h-1 rounded-full bg-white/70" />
              )}
              {!item.isOpen && <span className="w-0.5 h-0.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

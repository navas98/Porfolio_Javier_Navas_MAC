interface FolderIconProps {
  label: string;
  icon: string;
  onOpen: () => void;
}

export default function FolderIcon({ label, icon, onOpen }: FolderIconProps) {
  return (
    <div
      onDoubleClick={onOpen}
      className="flex flex-col items-center gap-1.5 cursor-pointer select-none group w-20"
    >
      <div className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform duration-150">
        {icon}
      </div>
      <span className="text-xs text-white text-center px-1.5 py-0.5 rounded drop-shadow-md group-hover:bg-blue-500/60 transition-colors">
        {label}
      </span>
    </div>
  );
}

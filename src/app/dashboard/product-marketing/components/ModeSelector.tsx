'use client';

import { Mode } from '../types/product-marketing';

interface ModeSelectorProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700 w-fit">
      <button
        onClick={() => onChange('wizard')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
          mode === 'wizard'
            ? 'bg-cyan-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        🔮 向導模式
      </button>
      <button
        onClick={() => onChange('quick')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
          mode === 'quick'
            ? 'bg-cyan-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        ⚡ 快速模式
      </button>
    </div>
  );
}

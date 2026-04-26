'use client';

import { Module } from '../types/product-marketing';

interface ModuleCardsProps {
  selected: Module | null;
  onChange: (module: Module) => void;
}

const MODULES = [
  {
    id: 'analysis' as Module,
    icon: '🔍',
    title: '產品分析',
    description: 'URL 分析、FAB、AIDA 框架',
    color: 'cyan',
  },
  {
    id: 'campaign' as Module,
    icon: '📣',
    title: '廣告企劃',
    description: 'Ad Directions、Campaign 結構、預算分配',
    color: 'blue',
  },
  {
    id: 'performance' as Module,
    icon: '📊',
    title: '成效追蹤',
    description: 'CSV 上傳、AI 洞察、優化建議',
    color: 'green',
  },
];

const COLOR_CLASSES: Record<string, { border: string; bg: string; icon: string; selected: string }> = {
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    icon: 'text-cyan-400',
    selected: 'ring-1 ring-cyan-500 border-cyan-500 bg-cyan-500/10',
  },
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    selected: 'ring-1 ring-blue-500 border-blue-500 bg-blue-500/10',
  },
  green: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    icon: 'text-green-400',
    selected: 'ring-1 ring-green-500 border-green-500 bg-green-500/10',
  },
};

export default function ModuleCards({ selected, onChange }: ModuleCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {MODULES.map((mod) => {
        const colors = COLOR_CLASSES[mod.color];
        const isSelected = selected === mod.id;
        
        return (
          <button
            key={mod.id}
            onClick={() => onChange(mod.id)}
            className={`p-4 rounded-xl border text-left transition ${
              isSelected
                ? colors.selected
                : `border-slate-700 bg-slate-800/30 hover:${colors.border} hover:bg-slate-800/50`
            }`}
          >
            <div className={`text-3xl mb-3 ${colors.icon}`}>{mod.icon}</div>
            <div className="text-white font-semibold text-sm mb-1">{mod.title}</div>
            <div className="text-slate-400 text-xs">{mod.description}</div>
          </button>
        );
      })}
    </div>
  );
}

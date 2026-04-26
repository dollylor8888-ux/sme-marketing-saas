'use client';

import { Industry } from '../types/product-marketing';

interface IndustryToggleProps {
  industry: Industry;
  onChange: (industry: Industry) => void;
}

export default function IndustryToggle({ industry, onChange }: IndustryToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700 w-fit">
      <button
        onClick={() => onChange('ecommerce')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
          industry === 'ecommerce'
            ? 'bg-cyan-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        🛒 電商
      </button>
      <button
        onClick={() => onChange('restaurant')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
          industry === 'restaurant'
            ? 'bg-cyan-500 text-white'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        🍜 餐廳
      </button>
    </div>
  );
}

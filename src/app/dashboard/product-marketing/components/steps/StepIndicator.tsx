'use client';

import { Check } from 'lucide-react';
import { Step } from '../../types/product-marketing';

interface StepIndicatorProps {
  current: Step;
  total: number;
}

const STEP_LABELS = ['URL', '分析', '賣點', '優化', '廣告結構', '創意', '成效'];

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="mb-6 lg:mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-start lg:justify-center min-w-max">
        {STEP_LABELS.slice(0, total).map((label, index) => {
          const stepNum = (index + 1) as Step;
          const isActive = stepNum === current;
          const isPast = stepNum < current;
          
          return (
            <div key={stepNum} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold transition ${
                  isPast ? 'bg-green-500 text-white' : isActive ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {isPast ? <Check className="w-4 h-4 lg:w-5 lg:h-5" /> : stepNum}
                </div>
                <span className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{label}</span>
              </div>
              {index < total - 1 && (
                <div className={`w-8 lg:w-12 h-0.5 mx-1 lg:mx-2 ${isPast ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { Delete } from 'lucide-react';

interface MathKeypadProps {
  onInsert: (text: string) => void;
  onDelete: () => void;
  isOpen: boolean;
}

const MathKeypad: React.FC<MathKeypadProps> = ({ onInsert, onDelete, isOpen }) => {
  if (!isOpen) return null;

  const sections = [
    {
      label: 'Calculus',
      keys: [
        { label: '∫', val: '∫ ' },
        { label: 'd/dx', val: 'd/dx ' },
        { label: '∂', val: '∂ ' },
        { label: 'lim', val: 'lim_{x→∞} ' },
        { label: '∑', val: '∑ ' },
        { label: '∞', val: '∞' },
      ]
    },
    {
      label: 'Functions',
      keys: [
        { label: 'sin', val: 'sin(' },
        { label: 'cos', val: 'cos(' },
        { label: 'tan', val: 'tan(' },
        { label: 'ln', val: 'ln(' },
        { label: 'e^x', val: 'e^' },
        { label: 'log', val: 'log(' },
      ]
    },
    {
      label: 'Algebra',
      keys: [
        { label: 'x²', val: '^2' },
        { label: 'xⁿ', val: '^' },
        { label: '√', val: '√(' },
        { label: 'a/b', val: '/' }, 
        { label: 'π', val: 'π' },
        { label: 'θ', val: 'θ' },
      ]
    },
  ];

  const numPad = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  return (
    <div className="w-full bg-slate-950 border-t border-slate-800 p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-300 shadow-2xl">
      
      {/* Symbol Pad */}
      <div className="space-y-3 order-2 md:order-1">
        {sections.map((section) => (
          <div key={section.label}>
             <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1.5 px-1">{section.label}</h4>
             <div className="grid grid-cols-6 gap-1.5">
                {section.keys.map((k) => (
                <button
                    key={k.label}
                    onClick={() => onInsert(k.val)}
                    className="flex items-center justify-center py-3 bg-slate-900 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-slate-300 hover:text-indigo-300 text-sm font-medium transition-all"
                >
                    {k.label}
                </button>
                ))}
             </div>
          </div>
        ))}
      </div>

      {/* Number Pad / Basic Ops */}
      <div className="order-1 md:order-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
         <div className="grid grid-cols-4 gap-2 h-full">
            <button onClick={() => onInsert('(')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-3 text-lg font-medium border border-slate-700">(</button>
            <button onClick={() => onInsert(')')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-3 text-lg font-medium border border-slate-700">)</button>
            <button onClick={() => onInsert('x')} className="bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg p-3 text-lg font-serif italic border border-slate-700">x</button>
            <button onClick={() => onInsert('y')} className="bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg p-3 text-lg font-serif italic border border-slate-700">y</button>

            {numPad.map((key) => {
                if (key === '=') return null; 
                const isOp = ['÷', '×', '-', '+'].includes(key);
                let val = key;
                if (key === '÷') val = '/';
                if (key === '×') val = '*';

                return (
                <button
                    key={key}
                    onClick={() => onInsert(val)}
                    className={`p-3 rounded-lg text-lg font-semibold transition-all shadow-sm ${
                    isOp 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20' 
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                >
                    {key}
                </button>
                );
            })}
            
            {/* Backspace Button */}
            <button 
                onClick={onDelete} 
                className="col-span-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg flex items-center justify-center"
            >
            <Delete size={22} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default MathKeypad;
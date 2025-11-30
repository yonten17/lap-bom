import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    katex: any;
  }
}

interface MathPreviewProps {
  input: string;
}

const MathPreview: React.FC<MathPreviewProps> = ({ input }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  // Map common human-readable symbols to LaTeX for previewing
  const toLatex = (str: string) => {
    let latex = str;
    latex = latex.replace(/∫/g, '\\int ');
    latex = latex.replace(/∑/g, '\\sum ');
    latex = latex.replace(/∏/g, '\\prod ');
    latex = latex.replace(/∂/g, '\\partial ');
    latex = latex.replace(/∞/g, '\\infty ');
    latex = latex.replace(/π/g, '\\pi ');
    latex = latex.replace(/θ/g, '\\theta ');
    latex = latex.replace(/√\(/g, '\\sqrt{('); // Handle sqrt with paren
    latex = latex.replace(/√/g, '\\sqrt{}'); // Handle bare sqrt
    latex = latex.replace(/→/g, '\\to ');
    latex = latex.replace(/×/g, '\\times ');
    latex = latex.replace(/÷/g, '\\div ');
    // Simple heuristic for fractions using / 
    // This is not perfect for complex nested fractions but helps for simple cases in preview
    // latex = latex.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}'); 
    return latex;
  };

  useEffect(() => {
    if (!containerRef.current || !window.katex) return;

    // Only attempt to render if the input looks somewhat like math or has LaTeX/Unicode symbols
    const isMathy = input.match(/[\\^_{}=∫∑∂∞πθ√+*/-]/) || input.match(/[0-9]/);
    
    if (!input.trim()) {
        containerRef.current.innerHTML = '';
        return;
    }

    try {
      const latexInput = toLatex(input);
      // Clean display mode wrappers if user typed them
      const cleanInput = latexInput.replace(/\$\$/g, '');
      
      window.katex.render(cleanInput, containerRef.current, {
        throwOnError: false,
        displayMode: true,
        errorColor: '#ef4444',
      });
      setHasError(false);
    } catch (e) {
      setHasError(true);
    }
  }, [input]);

  if (!input.trim()) return null;

  return (
    <div className="w-full px-4 py-3 bg-slate-900 border-t border-x border-slate-800 rounded-t-xl mb-[-1px] z-10 animate-in fade-in slide-in-from-bottom-2 flex flex-col justify-center min-h-[60px]">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 opacity-70">Formatted Preview</div>
      <div 
        ref={containerRef} 
        className="text-indigo-100 text-xl overflow-x-auto whitespace-nowrap scrollbar-none flex items-center h-full"
      />
    </div>
  );
};

export default MathPreview;
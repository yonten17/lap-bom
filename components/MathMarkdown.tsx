import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathMarkdownProps {
  content: string;
}

const MathMarkdown: React.FC<MathMarkdownProps> = ({ content }) => {
  // Pre-process content to ensure standard LaTeX delimiters usually used by Gemini ($$) work well with remark-math
  // Sometimes models output \[ \] or \( \), remark-math handles $ and $$ best.
  // This is a lightweight pass-through.
  
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            // Custom renderer for paragraphs to avoid hydration mismatches with block math
            p: ({node, children}) => {
                return <p className="mb-4 text-gray-200 leading-relaxed">{children}</p>;
            },
            // Style code blocks
            code: ({node, className, children, ...props}) => {
                return (
                    <code className={`${className} bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-yellow-300`} {...props}>
                        {children}
                    </code>
                );
            }
        }}
      />
    </div>
  );
};

export default MathMarkdown;
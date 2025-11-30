import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Camera as CameraIcon, Trash2, Loader2, Copy, Check, X, Keyboard, MessageCircleQuestion, CornerDownRight, Brain } from 'lucide-react';
import { Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { fileToBase64, resizeImage } from './utils/imageUtils';
import MathMarkdown from './components/MathMarkdown';
import CameraModal from './components/CameraModal';
import MathKeypad from './components/MathKeypad';
import MathPreview from './components/MathPreview';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Ready. Enter problem."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]); 
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, replyTo]);

  const handleSendMessage = async () => {
    if ((!input.trim() && attachedImages.length === 0) || isLoading) return;

    // Detect if the input contains math symbols (latex or unicode)
    // If it has math-like content, we ensure it looks nice in history.
    // We wrap it in display math $$ if it looks like a formula and isn't wrapped.
    const isFormula = /[=\\∫∑∂∞√^]/.test(input);
    let displayContent = input;
    
    // Simple heuristic: if it looks like a formula, treat as LaTeX for history display
    // We rely on Gemini to actually parse the raw input.
    if (isFormula && !input.includes('$$')) {
        displayContent = input; 
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      images: attachedImages
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedImages([]);
    setReplyTo(null); // Clear reply context
    setIsLoading(true);
    setShowKeypad(false);

    try {
      // Pass reply content as context if it exists
      const contextMessage = replyTo ? replyTo.content : undefined;
      
      const promptToSend = input || "Analyze this image"; // Fallback text if only image is sent

      const responseText = await sendMessageToGemini(messages, promptToSend, userMessage.images, contextMessage);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText
      };
      
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        const resized = await resizeImage(base64); 
        setAttachedImages(prev => [...prev, resized]);
      } catch (err) {
        console.error("Image processing failed", err);
      }
    }
  };

  const handleCameraCapture = (base64: string) => {
    setAttachedImages(prev => [...prev, base64]);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: "History cleared."
      }
    ]);
  };

  const insertTextAtCursor = (text: string) => {
    const el = inputRef.current;
    if (!el) {
      setInput(prev => prev + text);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentVal = el.value;
    const newVal = currentVal.substring(0, start) + text + currentVal.substring(end);
    setInput(newVal);

    setTimeout(() => {
        el.focus();
        const newCursorPos = start + text.length;
        // Adjust cursor for function calls like sin() to put cursor inside parens
        if (text.endsWith('()') || text.endsWith('{}')) {
             el.setSelectionRange(newCursorPos - 1, newCursorPos - 1);
        } else if (text === '√(') {
            el.setSelectionRange(newCursorPos, newCursorPos); // Keep after (
        } else {
             el.setSelectionRange(newCursorPos, newCursorPos);
        }
    }, 0);
  };

  const handleBackspace = () => {
     const el = inputRef.current;
     if (!el) return;
     const start = el.selectionStart;
     const end = el.selectionEnd;
     const currentVal = el.value;

     if (start === end) {
        if (start === 0) return;
        setInput(currentVal.substring(0, start - 1) + currentVal.substring(end));
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start - 1, start - 1);
        }, 0);
     } else {
        setInput(currentVal.substring(0, start) + currentVal.substring(end));
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start, start);
        }, 0);
     }
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setHasStarted(false)} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Brain className="text-white w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Lap Bom
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide">CALCULUS SOLVER</p>
          </div>
        </button>
        <button 
          onClick={clearHistory}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-full transition-all"
          title="Clear History"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 scroll-smooth">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[90%] md:max-w-[80%] lg:max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.images && msg.images.length > 0 && (
                    <div className="mb-2 flex gap-2 flex-wrap justify-end">
                    {msg.images.map((img, idx) => (
                        <img 
                        key={idx} 
                        src={`data:image/jpeg;base64,${img}`} 
                        alt="User attachment" 
                        className="h-32 w-auto rounded-lg border border-slate-700/50 shadow-md object-cover"
                        />
                    ))}
                    </div>
                )}

                <div 
                    className={`relative rounded-2xl p-5 shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-900/10' 
                        : 'bg-slate-900 text-slate-200 rounded-tl-sm border border-slate-800'
                    }`}
                >
                    <MathMarkdown content={msg.content} />
                    
                    {/* Action Bar for Model Messages */}
                    {msg.role === 'model' && (
                        <div className="absolute -bottom-10 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                             <CopyButton content={msg.content} />
                             <button 
                                onClick={() => {
                                    setReplyTo(msg);
                                    inputRef.current?.focus();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-indigo-300 transition-all shadow-sm"
                             >
                                <MessageCircleQuestion size={14} />
                                Ask Doubt
                             </button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start w-full animate-pulse">
             <div className="bg-slate-900 rounded-2xl rounded-tl-sm p-6 border border-slate-800 flex items-center gap-4 min-w-[200px]">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <div className="space-y-2">
                    <div className="h-2 w-24 bg-slate-800 rounded"></div>
                    <div className="h-2 w-32 bg-slate-800 rounded"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area */}
      <div className="bg-slate-950 border-t border-slate-800 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* Reply Context Banner */}
        {replyTo && (
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between backdrop-blur animate-in slide-in-from-bottom-2 fade-in">
                <div className="flex items-center gap-3 text-sm text-slate-400 overflow-hidden">
                    <CornerDownRight size={16} className="text-indigo-400 flex-shrink-0" />
                    <span className="truncate max-w-xs md:max-w-md">Asking about solution...</span>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-300">
                    <X size={16} />
                </button>
            </div>
        )}

        {/* Input Controls */}
        <div className="p-4 max-w-5xl mx-auto space-y-3">
          
          {attachedImages.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group flex-shrink-0">
                  <img 
                    src={`data:image/jpeg;base64,${img}`} 
                    alt="Preview" 
                    className="h-16 w-16 object-cover rounded-lg border border-slate-600 shadow-lg" 
                  />
                  <button 
                    onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 items-end">
             {/* Media Buttons */}
             <div className="flex flex-row md:flex-col gap-2">
                <button 
                  onClick={() => setIsCameraOpen(true)}
                  className="p-3 text-slate-400 hover:text-indigo-400 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-indigo-500/30 shadow-sm"
                  title="Camera"
                >
                  <CameraIcon size={20} />
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-indigo-400 bg-slate-900 hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-indigo-500/30 shadow-sm"
                  title="Upload"
                >
                  <ImageIcon size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                
                <button 
                    onClick={() => setShowKeypad(!showKeypad)}
                    className={`p-3 rounded-xl transition-all border shadow-sm ${showKeypad ? 'text-indigo-400 bg-slate-800 border-indigo-500/50' : 'text-slate-400 bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
                    title="Math Keyboard"
                >
                    <Keyboard size={20} />
                </button>
             </div>

             {/* Text Input Wrapper */}
             <div className={`flex-1 flex flex-col relative bg-slate-900 rounded-xl border ${input.match(/[\\^_{}=]/) ? 'border-indigo-500/50' : 'border-slate-800'} focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all shadow-inner`}>
                
                {/* Live Preview */}
                <MathPreview input={input} />

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={replyTo ? "Explain which part?" : (showKeypad ? "Type math here..." : "e.g. ∫ 2x dx")}
                  className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 resize-none focus:ring-0 min-h-[60px] max-h-40 p-4 leading-relaxed font-mono text-sm"
                />
             </div>

             {/* Send Button */}
             <button 
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && attachedImages.length === 0)}
                className={`p-4 rounded-xl transition-all shadow-lg flex-shrink-0 ${
                    isLoading || (!input.trim() && attachedImages.length === 0)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-600/20'
                }`}
             >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
             </button>
          </div>
        </div>

        {/* Math Keypad Area */}
        <MathKeypad 
            isOpen={showKeypad} 
            onInsert={insertTextAtCursor} 
            onDelete={handleBackspace}
        />
      </div>

      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCameraCapture} 
      />
    </div>
  );
};

const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs text-slate-300 transition-all shadow-sm"
            title="Copy response"
        >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    )
}

export default App;
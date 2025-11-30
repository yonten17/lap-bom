import React from 'react';
import { ChevronRight, Camera, BrainCircuit, Brain, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <Brain className="text-white w-5 h-5" />
           </div>
           <span className="text-xl font-bold tracking-tight">Lap Bom</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 mt-[-40px]">
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 max-w-4xl">
           Calculus Solved. <br/>
           <span className="text-indigo-400">Instantly.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
           Lap Bom is the ultimate AI math companion. Snap a photo or type complex symbolic equations and get step-by-step solutions in milliseconds.
        </p>

        <button 
           onClick={onStart}
           className="group relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] hover:scale-105"
        >
           Begin Now
           <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
           <FeatureCard 
             icon={<BrainCircuit className="text-cyan-400" />}
             title="Symbolic AI"
             desc="Understands raw calculus notation like ∫, ∂, and lim just like a human."
           />
           <FeatureCard 
             icon={<Camera className="text-purple-400" />}
             title="Visual Input"
             desc="Don't want to type? Just snap a picture of your homework."
           />
           <FeatureCard 
             icon={<Brain className="text-pink-400" />}
             title="Live Rendering"
             desc="See your equations formatted beautifully in real-time LaTeX."
           />
        </div>

        {/* Team Section */}
        <div className="mt-24 mb-12 w-full max-w-4xl">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Developed By Team</h2>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                {['Thinley Wangdi', 'Tshewang Norbu', 'Yonten Thinley', 'Chencho Tshering Chokgyal'].map((name) => (
                    <div key={name} className="px-5 py-2 bg-slate-900/30 border border-slate-800 rounded-full text-slate-400 text-sm hover:text-indigo-300 hover:border-slate-700 transition-all cursor-default select-none">
                        {name}
                    </div>
                ))}
            </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-600 text-sm z-10">
        &copy; {new Date().getFullYear()} Lap Bom AI. Built for Speed.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/80 transition-colors text-left group">
     <div className="mb-4 p-3 bg-slate-950 rounded-xl inline-block group-hover:scale-110 transition-transform border border-slate-800">{icon}</div>
     <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
     <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
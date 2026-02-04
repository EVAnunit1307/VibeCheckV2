import React, { useState } from 'react';
import { generateCreativeIdea } from '../services/geminiService';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { GeminiStatus } from '../types';
import { Reveal } from './Reveal';

const AiDirector: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState<GeminiStatus>(GeminiStatus.IDLE);

  const handleBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setStatus(GeminiStatus.LOADING);
    setResponse('');
    
    try {
      const result = await generateCreativeIdea(input);
      setResponse(result);
      setStatus(GeminiStatus.SUCCESS);
    } catch (error) {
      setResponse("Connection to the hive mind failed.");
      setStatus(GeminiStatus.ERROR);
    }
  };

  return (
    <section className="py-32 px-4 md:px-12 bg-agency-black relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 border border-gray-800 bg-gray-900/20 backdrop-blur-sm p-8 md:p-16">
        <Reveal>
            <div className="flex items-center gap-3 mb-8">
            <Sparkles className="text-purple-500 w-5 h-5" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400">
                AI Creative Director
            </h2>
            </div>
        </Reveal>

        <Reveal delay={0.1}>
            <h3 className="text-4xl md:text-5xl font-display text-white mb-10 leading-tight">
            Stuck? Get an avant-garde concept from our AI.
            </h3>
        </Reveal>

        <Reveal delay={0.2}>
            <form onSubmit={handleBrainstorm} className="flex flex-col md:flex-row gap-0 md:gap-0 border-b border-gray-700 mb-12">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe a project (e.g., 'Cyberpunk coffee shop')"
                className="flex-1 bg-transparent py-6 text-xl md:text-2xl text-white focus:outline-none placeholder-gray-600 font-light"
            />
            <button 
                type="submit" 
                disabled={status === GeminiStatus.LOADING}
                className="group flex items-center justify-center gap-3 bg-white text-black px-10 py-6 font-bold uppercase tracking-wider hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-50"
            >
                {status === GeminiStatus.LOADING ? (
                <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                <>
                    Ignite <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
            </form>
        </Reveal>

        {response && (
           <div className="animate-fade-in-up">
             <p className="font-mono text-xs text-purple-400 mb-4 uppercase tracking-widest">[ Director's Output ]</p>
             <p className="text-2xl md:text-3xl text-gray-100 leading-relaxed font-light italic indent-8">
               "{response}"
             </p>
           </div>
        )}
      </div>
    </section>
  );
};

export default AiDirector;
import React from 'react';
import { ArrowDown } from 'lucide-react';
import { Reveal } from './Reveal';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-agency-black px-4 selection:bg-white selection:text-black">
      {/* Background Abstract Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-indigo-900/20 rounded-full blur-[100px] md:blur-[120px] animate-pulse pointer-events-none" />

      <div className="z-10 text-center flex flex-col items-center max-w-[90vw]">
        <Reveal width="100%" delay={0.1}>
            <p className="text-gray-400 tracking-[0.3em] text-xs md:text-sm uppercase mb-4 md:mb-8 text-center">
            Digital Design & Experience Agency
            </p>
        </Reveal>

        <div className="flex flex-col items-center">
            <Reveal effect="curtain" delay={0.2}>
                <h1 className="font-display font-bold text-[12vw] md:text-9xl leading-[0.85] tracking-tighter mix-blend-difference text-white">
                DIGITAL
                </h1>
            </Reveal>
            <Reveal effect="curtain" delay={0.35}>
                <h1 className="font-display font-bold text-[12vw] md:text-9xl leading-[0.85] tracking-tighter text-transparent stroke-text" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.7)' }}>
                REALITY
                </h1>
            </Reveal>
        </div>
        
        <Reveal delay={0.6}>
            <p className="mt-8 md:mt-12 max-w-lg text-center text-gray-400 text-sm md:text-lg leading-relaxed font-light">
            We craft immersive digital experiences that blur the line between the virtual and the physical.
            </p>
        </Reveal>
      </div>

      <div className="absolute bottom-10 animate-bounce opacity-50">
        <ArrowDown className="text-white w-5 h-5" />
      </div>
    </section>
  );
};

export default Hero;
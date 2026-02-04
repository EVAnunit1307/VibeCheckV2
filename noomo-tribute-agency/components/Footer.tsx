import React from 'react';
import { Reveal } from './Reveal';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-black text-white pt-32 pb-12 px-4 md:px-12 border-t border-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-32">
        <div className="max-w-2xl">
          <Reveal>
              <h2 className="text-6xl md:text-9xl font-display font-bold mb-8 leading-[0.8]">
                LET'S TALK
              </h2>
          </Reveal>
          <Reveal delay={0.1}>
              <a href="mailto:hello@noomo.ai" className="inline-block text-2xl md:text-4xl text-gray-400 hover:text-white border-b border-gray-700 hover:border-white transition-all pb-2 mt-4">
                hello@noomo.ai
              </a>
          </Reveal>
        </div>
        
        <div className="mt-16 md:mt-0 flex flex-wrap gap-8 md:gap-12">
           {['Instagram', 'Twitter', 'LinkedIn', 'Behance'].map((social, i) => (
             <Reveal key={social} delay={0.2 + (i * 0.05)}>
                 <a href="#" className="text-sm uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                {social}
                 </a>
             </Reveal>
           ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between text-[10px] md:text-xs text-gray-600 uppercase tracking-widest border-t border-gray-900 pt-8">
        <span>© 2024 Noomo Tribute Agency</span>
        <span className="mt-4 md:mt-0">Designed & Developed by AI</span>
      </div>
    </footer>
  );
};

export default Footer;
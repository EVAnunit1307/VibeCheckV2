import React, { useState } from 'react';
import { Reveal } from './Reveal';
import { ArrowUpRight } from 'lucide-react';

const Services: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const services = [
    { title: 'Digital Strategy', desc: 'Brand Positioning, Content Strategy, UX Research' },
    { title: 'Visual Identity', desc: 'Logo Design, Art Direction, Motion Systems' },
    { title: 'Web Experience', desc: 'Creative Development, WebGL, E-Commerce' },
    { title: 'Content Production', desc: '3D Motion, Video Production, Copywriting' }
  ];

  return (
    <section id="expertise" className="py-24 md:py-40 px-4 md:px-12 bg-zinc-900 text-white relative z-10">
       <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-10">
          <div className="md:col-span-4 sticky top-24 h-fit">
             <Reveal delay={0.1}>
                 <h2 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                    <span className="w-2 h-2 bg-agency-accent rounded-full"></span>
                    Our Expertise
                 </h2>
             </Reveal>
             <Reveal delay={0.2}>
                <p className="text-2xl md:text-3xl font-light text-gray-200 leading-tight">
                We blend strategy, design, and technology to build brands that lead culture.
                </p>
             </Reveal>
          </div>
          <div className="md:col-span-8 flex flex-col">
             {services.map((service, i) => (
               <Reveal key={i} delay={i * 0.1}>
                   <div 
                    className="group border-t border-gray-800 py-12 cursor-pointer transition-all duration-500 relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ 
                        opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.3 : 1 
                    }}
                   >
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-4xl md:text-6xl font-display font-bold mb-4 group-hover:translate-x-4 transition-transform duration-500">
                            {service.title}
                        </h3>
                        <ArrowUpRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500 text-agency-accent w-8 h-8" />
                      </div>
                      <p className="text-gray-500 font-mono text-sm uppercase tracking-wide group-hover:translate-x-4 transition-transform duration-500 delay-75">
                        {service.desc}
                      </p>
                   </div>
               </Reveal>
             ))}
             <div className="border-t border-gray-800"></div>
          </div>
       </div>
    </section>
  );
};

export default Services;
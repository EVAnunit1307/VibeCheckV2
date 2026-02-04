import React from 'react';
import { Project } from '../types';
import { Reveal } from './Reveal';

const projects: Project[] = [
  { id: '1', title: 'NEON VERSE', category: 'Immersive Web', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: '2', title: 'AERO DYNAMICS', category: '3D & Motion', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2670&auto=format&fit=crop' },
  { id: '3', title: 'URBAN FLUX', category: 'Branding', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop' },
  { id: '4', title: 'SILENT MODE', category: 'App Design', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop' },
];

const Work: React.FC = () => {
  return (
    <section id="work" className="py-24 md:py-40 px-4 md:px-12 bg-agency-black">
      <div className="mb-24 flex flex-col md:flex-row justify-between items-end border-b border-gray-900 pb-8">
        <Reveal>
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white uppercase leading-none">
            Selected<br/>Works
            </h2>
        </Reveal>
        <Reveal delay={0.2}>
            <span className="text-gray-500 uppercase tracking-widest text-xs mt-6 md:mt-0 block">
            (2023 — 2025)
            </span>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
        {projects.map((project, index) => (
          <div 
            key={project.id} 
            className={`group cursor-pointer relative ${index % 2 !== 0 ? 'md:mt-32' : ''}`}
          >
            <Reveal delay={0.1}>
                <div className="overflow-hidden mb-8 relative w-full aspect-[4/5] md:aspect-[3/4]">
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-600/20 z-10 transition-colors duration-700 mix-blend-overlay"></div>
                <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                </div>
            </Reveal>
            
            <div className="flex flex-col gap-2">
              <Reveal delay={0.2} effect="curtain">
                  <h3 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-tight group-hover:text-transparent group-hover:stroke-text transition-all duration-300" style={{ transition: '0.3s' }}>
                    {project.title}
                  </h3>
              </Reveal>
              <Reveal delay={0.3}>
                  <div className="flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-gray-700"></span>
                    <span className="text-xs uppercase tracking-widest text-gray-400">
                        {project.category}
                    </span>
                  </div>
              </Reveal>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Work;
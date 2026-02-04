import React, { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-6 mix-blend-difference text-white">
        <div className="font-display font-bold text-2xl tracking-widest cursor-pointer">
          NOOMO<span className="text-gray-500">.AI</span>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <span className="hidden md:block text-sm font-semibold tracking-widest uppercase">Menu</span>
          <Menu className="w-8 h-8" />
        </button>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div className={`fixed inset-0 bg-agency-black z-[60] flex flex-col justify-center items-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform duration-500"
        >
          <X className="w-10 h-10" />
        </button>

        <ul className="space-y-6 text-center">
          {['Work', 'Agency', 'Expertise', 'Contact'].map((item, index) => (
            <li key={item} className="overflow-hidden">
              <a 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setIsOpen(false)}
                className="block text-5xl md:text-7xl font-display font-bold text-transparent hover:text-white transition-colors duration-300 stroke-text hover:stroke-0"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="absolute bottom-10 left-0 w-full px-10 flex justify-between text-gray-500 uppercase text-xs tracking-widest">
          <span>San Francisco, CA</span>
          <span className="flex items-center gap-1">Get in touch <ArrowUpRight size={14} /></span>
        </div>
      </div>
    </>
  );
};

export default Navbar;

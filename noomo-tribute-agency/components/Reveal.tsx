import React, { useRef, useEffect, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
  className?: string;
  effect?: 'slide-up' | 'curtain';
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = 'fit-content', 
  delay = 0, 
  className = '',
  effect = 'slide-up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // We don't disconnect immediately for 'exit' animations if we wanted them, 
        // but for this agency style, reveal-once is standard.
        observer.disconnect(); 
      }
    }, { threshold: 0.15 });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (effect === 'curtain') {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width }}>
        <div
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Default slide-up fade
  return (
    <div ref={ref} className={`relative ${className}`} style={{ width }}>
      <div
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
          opacity: isVisible ? 1 : 0,
          transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
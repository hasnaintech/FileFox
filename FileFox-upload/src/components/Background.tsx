import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { AppTheme } from '../types';

interface ThemeConfig {
  backgroundColor: string;
  backgroundImage: string;
  ambientGlow: string;
  circles: { className: string }[];
}

const THEMES: Record<AppTheme, ThemeConfig> = {
  slate: {
    backgroundColor: '#0c0c14',
    backgroundImage: 'radial-gradient(circle at 10% 10%, #4f46e5 0%, transparent 45%), radial-gradient(circle at 90% 10%, #ec4899 0%, transparent 40%), radial-gradient(circle at 50% 90%, #06b6d4 0%, transparent 45%)',
    ambientGlow: 'bg-indigo-500/20',
    circles: [
      { className: "absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-indigo-600/25 blur-[100px] rounded-full pointer-events-none" },
      { className: "absolute top-1/2 left-1/4 w-[20rem] h-[20rem] bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" },
      { className: "absolute -top-32 right-1/4 w-[25rem] h-[25rem] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" }
    ]
  },
  sunset: {
    backgroundColor: '#14080b',
    backgroundImage: 'radial-gradient(circle at 15% 15%, #b91c1c 0%, transparent 45%), radial-gradient(circle at 85% 15%, #ea580c 0%, transparent 45%), radial-gradient(circle at 55% 85%, #db2777 0%, transparent 45%)',
    ambientGlow: 'bg-orange-500/15',
    circles: [
      { className: "absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-red-600/15 blur-[100px] rounded-full pointer-events-none" },
      { className: "absolute top-1/2 left-1/4 w-[20rem] h-[20rem] bg-orange-500/15 blur-[80px] rounded-full pointer-events-none" },
      { className: "absolute -top-32 right-1/4 w-[25rem] h-[25rem] bg-pink-500/15 blur-[90px] rounded-full pointer-events-none" }
    ]
  },
  ocean: {
    backgroundColor: '#030815',
    backgroundImage: 'radial-gradient(circle at 10% 10%, #1d4ed8 0%, transparent 45%), radial-gradient(circle at 90% 20%, #0d9488 0%, transparent 45%), radial-gradient(circle at 50% 85%, #0369a1 0%, transparent 45%)',
    ambientGlow: 'bg-blue-500/15',
    circles: [
      { className: "absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" },
      { className: "absolute top-1/3 left-1/3 w-[20rem] h-[20rem] bg-teal-500/15 blur-[80px] rounded-full pointer-events-none" },
      { className: "absolute -top-32 right-1/4 w-[25rem] h-[25rem] bg-cyan-600/15 blur-[90px] rounded-full pointer-events-none" }
    ]
  },
  emerald: {
    backgroundColor: '#040d08',
    backgroundImage: 'radial-gradient(circle at 15% 15%, #047857 0%, transparent 45%), radial-gradient(circle at 85% 25%, #0891b2 0%, transparent 45%), radial-gradient(circle at 50% 80%, #15803d 0%, transparent 40%)',
    ambientGlow: 'bg-emerald-500/15',
    circles: [
      { className: "absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-emerald-700/15 blur-[100px] rounded-full pointer-events-none" },
      { className: "absolute top-1/2 left-1/4 w-[20rem] h-[20rem] bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" },
      { className: "absolute -top-32 right-1/4 w-[25rem] h-[25rem] bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" }
    ]
  },
  aurora: {
    backgroundColor: '#070611',
    backgroundImage: 'radial-gradient(circle at 10% 10%, #6d28d9 0%, transparent 45%), radial-gradient(circle at 90% 15%, #059669 0%, transparent 45%), radial-gradient(circle at 50% 80%, #c084fc 0%, transparent 40%)',
    ambientGlow: 'bg-indigo-500/15',
    circles: [
      { className: "absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" },
      { className: "absolute top-1/2 left-1/4 w-[20rem] h-[20rem] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" },
      { className: "absolute -top-32 right-1/4 w-[25rem] h-[25rem] bg-fuchsia-500/10 blur-[90px] rounded-full pointer-events-none" }
    ]
  }
};

export function BackgroundMesh() {
  const { settings } = useApp();
  const activeThemeKey = settings.theme || 'slate';
  const currentTheme = THEMES[activeThemeKey] || THEMES.slate;

  // Sync document body background color with theme transitions
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = currentTheme.backgroundColor;
      document.body.style.transition = 'background-color 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
      const htmlEl = document.documentElement;
      if (htmlEl) {
        htmlEl.style.backgroundColor = currentTheme.backgroundColor;
        htmlEl.style.transition = 'background-color 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
      }
    }
  }, [currentTheme]);

  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: currentTheme.backgroundColor }}
    >
      {/* Visual background layers with opacity cross-fade */}
      {Object.entries(THEMES).map(([key, value]) => {
        const isSelected = key === activeThemeKey;
        return (
          <div
            key={key}
            className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            style={{
              opacity: isSelected ? 1 : 0,
              backgroundColor: value.backgroundColor,
              backgroundImage: value.backgroundImage,
            }}
          />
        );
      })}

      {/* Decorative "Liquid" Blur Circles */}
      {currentTheme.circles.map((circle, index) => (
        <div key={index} className={circle.className} />
      ))}
      
      {/* Ambient glass animation */}
      <motion.div 
        animate={{
          x: ["0%", "5%", "-5%", "0%"],
          y: ["0%", "5%", "-5%", "0%"],
          scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen blur-[120px] pointer-events-none transition-colors duration-1000 ${currentTheme.ambientGlow}`}
      />
    </div>
  );
}


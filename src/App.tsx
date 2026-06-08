import { BackgroundMesh } from './components/Background';
import { ConverterUI } from './components/ConverterUI';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';
import { useApp } from './context/AppContext';
import { motion } from 'motion/react';

export default function App() {
  const { isHistoryOpen, setHistoryOpen, isSettingsOpen, setSettingsOpen } = useApp();

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col font-sans overflow-hidden">
      <BackgroundMesh />
      
      {/* Visual Top Navigation Bar layer extracted from theme */}
      <nav className="h-24 w-full flex items-center justify-between px-6 sm:px-12 z-10 shrink-0 mt-2">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_20px_rgba(0,0,0,0.2)] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 pointer-events-none"></div>
            <svg className="w-6 h-6 text-white relative z-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">FileFox</span>
        </motion.div>
        
        <div className="flex gap-5 sm:gap-8 text-sm font-medium opacity-90 items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.92 }} 
            onClick={() => setHistoryOpen(true)}
            className="text-white/80 hover:text-white transition-colors duration-300 cursor-pointer font-semibold"
          >
            History
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.92 }} 
            onClick={() => setSettingsOpen(true)}
            className="text-white/80 hover:text-white transition-colors duration-300 cursor-pointer font-semibold"
          >
            Settings
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.04, y: -2 }} 
            whileTap={{ scale: 0.95 }} 
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="hidden min-[450px]:block bg-white/15 px-5 py-2.5 rounded-full border border-white/30 backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)] cursor-pointer text-white font-semibold relative overflow-hidden group/pro text-xs sm:text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none group-hover/pro:from-white/20 transition-all duration-300"></div>
            <span className="relative z-10 drop-shadow-sm">Upgrade to Pro</span>
          </motion.button>
        </div>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center justify-center py-8 z-10">
        <ConverterUI />
      </div>

      {/* Drawers overlaying top of the core content */}
      <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Visual Bottom Info Panel */}
      <footer className="h-16 px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between z-10 shrink-0 gap-2 sm:gap-0 pb-4 sm:pb-0 text-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Running</span>
        </div>
      </footer>
    </main>
  );
}


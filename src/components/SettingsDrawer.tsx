import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, RotateCcw, Sliders, Sparkles, Download, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppTheme } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: AppTheme; label: string; description: string; colors: string }[] = [
  { value: 'slate', label: 'Midnight Slate', description: 'Indigo & Electric Pink', colors: 'bg-gradient-to-tr from-indigo-500 via-pink-500 to-cyan-500' },
  { value: 'sunset', label: 'Coral Sunset', description: 'Fiery Rose & Solar Orange', colors: 'bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400' },
  { value: 'ocean', label: 'Deep Ocean', description: 'Royal Blue & Sea Teal', colors: 'bg-gradient-to-tr from-blue-700 via-sky-500 to-teal-400' },
  { value: 'emerald', label: 'Mint Oasis', description: 'Emerald, Lime & Jade', colors: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-lime-400' },
  { value: 'aurora', label: 'Neon Aurora', description: 'Starlight Fuchsia & Forest Teal', colors: 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-emerald-400' },
];

export function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { settings, updateSettings, clearHistory } = useApp();

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qValue = parseFloat(e.target.value);
    updateSettings({ quality: qValue });
  };

  const handleToggleAutoDownload = () => {
    updateSettings({ autoDownload: !settings.autoDownload });
  };

  const handleResetSettings = () => {
    updateSettings({
      quality: 0.9,
      autoDownload: false,
      theme: 'slate',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
          />

          {/* Drawer Panel - Floating Glass Capsule with Physics Drag dismissal */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 350 }}
            dragElastic={{ left: 0, right: 0.12 }}
            dragMomentum={false}
            onDragEnd={(e, info) => {
              // Dismiss drawer if swiped far enough to the right
              if (info.offset.x > 110) {
                onClose();
              }
            }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed right-0 md:right-4 top-0 md:top-4 bottom-0 md:bottom-4 w-full md:w-[calc(100%-32px)] max-w-md bg-[#ffffff0a] border-l md:border border-white/15 md:rounded-[36px] z-50 flex flex-col shadow-[[0_50px_100px_rgba(0,0,0,0.6)],inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden select-none"
            style={{
              backdropFilter: 'blur(35px) saturate(140%)',
              WebkitBackdropFilter: 'blur(35px) saturate(140%)'
            }}
          >
            {/* Ambient Background Liquid Blobs inside Settings Panel */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <motion.div
                animate={{
                  x: [0, -35, 25, 0],
                  y: [0, -45, 45, 0],
                  scale: [1, 1.15, 0.9, 1],
                  rotate: [0, -120, -360],
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-80 h-80 bg-violet-500/8 blur-[50px] rounded-full"
              />
              <motion.div
                animate={{
                  x: [0, 40, -30, 0],
                  y: [0, 50, -35, 0],
                  scale: [1, 0.9, 1.1, 1],
                }}
                transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 -left-20 w-72 h-72 bg-cyan-500/5 blur-[60px] rounded-full"
              />
            </div>

            {/* Swipe hint handle for drag dismiss */}
            <div className="w-full flex justify-center pt-2 pb-1 relative z-10">
              <div className="w-12 h-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-grab active:cursor-grabbing" title="Drag right to close" />
            </div>

            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between relative z-10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-violet-400"
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">Preferences</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Fine-tune converter parameters</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={handleResetSettings}
                  className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={onClose}
                  className="p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </motion.button>
              </div>
            </div>

            {/* Drawer Body with stagger physical entries */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 relative z-10 scrollbar-thin">
              {/* Theme Settings Section */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.05 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Liquid Theme
                </h3>
                
                <div className="space-y-2">
                  {THEME_OPTIONS.map((themeOption, idx) => {
                    const isSelected = settings.theme === themeOption.value;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 17, delay: 0.1 + idx * 0.04 }}
                        whileHover={{ scale: 1.015, x: 2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        whileTap={{ scale: 0.995 }}
                        key={themeOption.value}
                        onClick={() => updateSettings({ theme: themeOption.value })}
                        className={`p-3 rounded-2xl border transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? 'bg-white/10 border-white/20 shadow-[0_4px_15px_rgba(255,255,255,0.02)]' 
                            : 'bg-white/[0.04] border-transparent hover:border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Visual color indicators */}
                          <div className={`w-8 h-8 rounded-xl ${themeOption.colors} shrink-0 border border-white/20`} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-white text-sm font-bold">{themeOption.label}</span>
                            <span className="text-white/40 text-[11px] font-medium truncate">{themeOption.description}</span>
                          </div>
                        </div>

                        <div className="flex items-center">
                          {isSelected && (
                            <motion.div 
                              layoutId="active-theme-dot"
                              className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Quality Settings Slider Section */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  Format Quality
                </h3>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-bold">Image Compression</span>
                    <motion.span 
                      key={settings.quality}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 12 }}
                      className="text-indigo-300 font-extrabold text-sm font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md"
                    >
                      {Math.round(settings.quality * 100)}%
                    </motion.span>
                  </div>
                  
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.quality}
                    onChange={handleQualityChange}
                    className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none cursor-grab active:cursor-grabbing transition-all hover:scale-[1.01]"
                  />
                  
                  <p className="text-[10px] text-white/40 leading-relaxed pt-1 font-medium">
                    Affects JPEG, WebP, and document converters. Lower values heavily compress files to minimal storage sizes, while 100% preserves original lossless pixels.
                  </p>
                </div>
              </motion.div>

              {/* Behavior Section */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5" />
                  Workflow Habits
                </h3>

                <motion.div 
                  onClick={handleToggleAutoDownload}
                  whileHover={{ scale: 1.015, y: -1, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  whileTap={{ scale: 0.995 }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <div className="flex flex-col pr-4 min-w-0">
                    <span className="text-white text-sm font-bold flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-indigo-300 shrink-0" />
                      Auto-download file
                    </span>
                    <span className="text-white/40 text-[10px] mt-1 leading-relaxed font-medium">
                      Download converted files instantly as soon as conversion completes.
                    </span>
                  </div>
                  
                  {/* Customized iOS toggle with physical swipe transition */}
                  <div className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                    settings.autoDownload ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-white/10'
                  }`}>
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      style={{
                        marginLeft: settings.autoDownload ? 'auto' : '0'
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Privacy Warning */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.25 }}
                className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-3 shadow-inner"
              >
                <ShieldCheck className="w-6 h-6 text-indigo-300 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold">100% Private local sandbox</span>
                  <span className="text-white/40 text-[10px] mt-1 leading-relaxed font-semibold">
                    Image decoding and conversion takes place client-side. We construct zero database backups, telemetry pipes, or server logs.
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-white/[0.01]/30 backdrop-blur-md text-center relative z-10">
              <span className="text-[9px] text-white/30 uppercase tracking-widest font-extrabold">
                FileFox • Preferences Sync
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

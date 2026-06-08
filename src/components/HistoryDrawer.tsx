import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Clock, Download, ArrowRight, FileCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const { history, clearHistory, deleteHistoryItem } = useApp();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
            {/* Ambient Drifting Liquid Bubbles Inside Drawer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <motion.div
                animate={{
                  x: [0, 40, -20, 0],
                  y: [0, -50, 35, 0],
                  scale: [1, 1.2, 0.9, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -right-10 w-80 h-80 bg-indigo-500/8 blur-[50px] rounded-full"
              />
              <motion.div
                animate={{
                  x: [0, -30, 30, 0],
                  y: [0, 40, -40, 0],
                  scale: [1, 0.85, 1.15, 1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/3 -left-24 w-72 h-72 bg-pink-500/5 blur-[60px] rounded-full"
              />
            </div>

            {/* Swipe hint handle for desktop/mobile drag */}
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
                  className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-300"
                >
                  <Clock className="w-5 h-5" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-extrabold text-white tracking-tight">Conversion History</h2>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Local session storage</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1, y: -1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    onClick={() => {
                      if (confirm('Clear all conversion records?')) {
                        clearHistory();
                      }
                    }}
                    className="p-2 ml-1 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                    title="Clear history"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </motion.button>
                )}
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

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10 scrollbar-thin">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                  <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4">
                    <FileCheck className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1">No conversions yet</h3>
                  <p className="text-white/40 text-xs max-w-[245px]">
                    Your converted files will appear here for downloading and management.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: 25, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 150,
                        damping: 18,
                        delay: Math.min(index * 0.04, 0.4)
                      }}
                      whileHover={{ scale: 1.015, y: -2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      whileTap={{ scale: 0.99 }}
                      key={item.id}
                      className="bg-white/[0.04] border border-white/[0.08] hover:border-white/15 rounded-2xl p-4 flex flex-col gap-3 transition-colors relative shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] cursor-pointer group"
                    >
                      {/* Top Info row */}
                      <div className="flex items-start justify-between gap-2 overflow-hidden">
                        <div className="flex flex-col min-w-0">
                          <span className="text-white text-sm font-bold truncate pr-1" title={item.fileName}>
                            {item.fileName}
                          </span>
                          <span className="text-[11px] text-white/40 mt-1 flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {formatTime(item.timestamp)}
                            <span className="inline-block w-1 h-1 rounded-full bg-white/20" />
                            {formatSize(item.fileSize)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] font-bold text-white/60 uppercase">
                            {item.originalFormat}
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/20" />
                          <span className="px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-400/20 rounded-md text-[9px] font-bold text-indigo-300 uppercase">
                            {item.targetFormat}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                            className="p-1 px-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-red-400 transition-all border border-transparent cursor-pointer ml-1.5 flex items-center justify-center shrink-0"
                            title="Delete this item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Download Link/Button with bouncy interactive response */}
                      {item.downloadUrl ? (
                        <div className="flex justify-end pt-0.5">
                          <motion.a
                            href={item.downloadUrl}
                            download={`${item.fileName.substring(0, item.fileName.lastIndexOf('.')) || item.fileName}-converted.${item.targetFormat}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-white border border-indigo-500/30 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-colors self-end"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Again
                          </motion.a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-white/30 italic text-right font-medium">
                          Link expired (session closed)
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-white/[0.01]/30 backdrop-blur-md text-center relative z-10">
              <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                Drag right to close. All computations occur client-side inside your browser sandbox.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

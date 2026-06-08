import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { Download, UploadCloud, RefreshCw, FileImage, Video, X, Info, ShieldCheck } from 'lucide-react';
import { convertImage, SupportedFormat } from '../lib/converter';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

const IMAGE_FORMATS: { value: SupportedFormat; label: string }[] = [
  { value: 'png', label: 'PNG Image' },
  { value: 'jpeg', label: 'JPEG Image' },
  { value: 'webp', label: 'WebP Image' },
  { value: 'pdf', label: 'PDF Document' },
  { value: 'gif', label: 'GIF Graphic' },
  { value: 'bmp', label: 'BMP Bitmap' },
  { value: 'ico', label: 'ICO Windows Icon' },
  { value: 'tiff', label: 'TIFF Format' },
];

const VIDEO_FORMATS: { value: SupportedFormat; label: string }[] = [
  { value: 'webm', label: 'WebM Video' },
  { value: 'mp4', label: 'MP4 Video' },
  { value: 'mov', label: 'QuickTime Video' },
  { value: 'avi', label: 'AVI Video' },
  { value: 'mkv', label: 'MKV Video' },
  { value: 'gif', label: 'Animated GIF' },
];

const ALL_FORMATS = [...IMAGE_FORMATS, ...VIDEO_FORMATS];

export function ConverterUI() {
  const { settings, addHistoryItem } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('png');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    setConvertedUrl(prevUrl => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    setConvertedFileName(null);
    if (fileRejections.length > 0) {
      setError('Please upload a valid image or video file.');
      return;
    }
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setCustomName(baseName);
      
      // Auto toggle format helper: if user uploads video, default target format is webm, if image, default is png
      if (selectedFile.type.startsWith('video/')) {
        setTargetFormat('webm');
      } else {
        setTargetFormat('png');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.ico', '.tiff'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
  } as any);

  const handleConvert = async () => {
    if (!file) return;
    setIsConverting(true);
    setProgress(0);
    setError(null);
    setConvertedUrl(null);

    try {
      const blob = await convertImage(file, targetFormat, settings.quality, (pct) => {
        setProgress(pct);
      });
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
      
      let baseName = customName.trim();
      // Avoid duplicate extension issues if users type .png or .pdf manually
      if (baseName.toLowerCase().endsWith('.' + targetFormat)) {
        baseName = baseName.substring(0, baseName.length - (targetFormat.length + 1));
      }
      if (!baseName) {
        baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
      }
      const finalFileName = `${baseName}.${targetFormat}`;
      setConvertedFileName(finalFileName);

      // Save conversion to the persistent history context
      const originalExt = file.name.substring(file.name.lastIndexOf('.') + 1) || 'file';
      addHistoryItem({
        fileName: file.name,
        fileSize: file.size,
        originalFormat: originalExt,
        targetFormat: targetFormat,
        downloadUrl: url,
      });

      // Handle automatic download action if active
      if (settings.autoDownload) {
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (err: any) {
      setError(err.message || 'Error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (convertedUrl) {
      URL.revokeObjectURL(convertedUrl);
    }
    setFile(null);
    setCustomName('');
    setConvertedUrl(null);
    setConvertedFileName(null);
    setError(null);
  };

  const handleFormatChange = (format: SupportedFormat) => {
    if (targetFormat !== format) {
      setTargetFormat(format);
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl);
      }
      setConvertedUrl(null);
      setConvertedFileName(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8 items-center z-10 px-4">
      {/* Main Glass Panel */}
      <motion.div 
        layout
        className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_0_20px_0_rgba(255,255,255,0.05)] rounded-[48px] p-6 sm:p-10 relative"
      >
        <AnimatePresence mode="popLayout">
          {!file ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "w-full aspect-[4/3] rounded-[32px] border border-white/20 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-colors duration-500 ease-out group shadow-[inset_0_2px_20px_rgba(255,255,255,0.05)]",
                  isDragActive 
                    ? "bg-white/10 border-white/60 shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]" 
                    : "bg-white/5 hover:bg-white/10 hover:border-white/30"
                )}
              >
                <input {...getInputProps()} />
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-[32px] sm:rounded-[40px] flex items-center justify-center mb-6 sm:mb-8 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:rotate-[-5deg] group-hover:scale-110 transition-all duration-500 ease-out">
                  <UploadCloud className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-300 drop-shadow-md" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-sm">
                  {isDragActive ? "Drop here" : "Drop your files here"}
                </h3>
                <p className="text-white/60 mb-6 sm:mb-8 text-sm">
                  Support for Images & Video files.
                </p>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="px-8 py-4 bg-white/90 backdrop-blur-md border border-white/50 text-slate-900 font-bold rounded-[20px] shadow-[0_10px_30px_rgba(255,255,255,0.2)] relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-[20px]"></div>
                  <span className="relative z-10">Browse Files</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* File Info Bar with Renaming Input */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[28px] relative shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] gap-4 select-none"
              >
                {/* Header info row */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-11 h-11 bg-indigo-500/20 rounded-[16px] flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
                      {file.type.startsWith('video/') ? (
                        <Video className="w-5 h-5 animate-pulse" />
                      ) : (
                        <FileImage className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-white/40 font-bold text-[10px] tracking-wider uppercase">Uploaded {file.type.startsWith('video/') ? 'Video' : 'File'}</span>
                      <span className="text-white font-bold text-sm truncate pr-2" title={file.name}>{file.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-bold shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={clearFile}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Editable rename input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest block font-sans">Output Filename</label>
                  <div className="relative flex items-center bg-black/40 border border-white/10 focus-within:border-indigo-500/50 rounded-xl transition-all shadow-inner px-3 py-2 overflow-hidden w-full">
                    <input 
                      type="text"
                      className="bg-transparent text-white text-xs font-bold outline-none flex-1 min-w-0 pr-1 placeholder-white/30"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        // Reset previously converted output files to ensure rebuild with new custom name
                        if (convertedUrl) {
                          URL.revokeObjectURL(convertedUrl);
                          setConvertedUrl(null);
                          setConvertedFileName(null);
                        }
                      }}
                      placeholder="Specify output filename"
                    />
                    <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/20 uppercase relative z-10 select-none shrink-0 font-mono">
                      .{targetFormat}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Format Selection Bar */}
              {(() => {
                const isVideo = file.type.startsWith('video/');
                const activeFormats = isVideo ? VIDEO_FORMATS : IMAGE_FORMATS;
                const gridColsClass = isVideo ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4 sm:grid-cols-8";

                return (
                  <div className="bg-white/10 backdrop-blur-2xl rounded-[36px] border border-white/20 flex flex-col items-stretch p-4 gap-3 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] relative z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[36px]"></div>
                    <div className="flex justify-between items-center sm:px-1.5 relative z-10">
                      <span className="text-white/70 font-extrabold uppercase tracking-widest text-[10px] font-sans">
                        Convert To
                      </span>
                      <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wide bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/25 font-sans">
                        {ALL_FORMATS.find(f => f.value === targetFormat)?.label || targetFormat.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* 100% Mathematically Even Grid fixing uneven elements or wrapped elements */}
                    <div className={cn("relative z-10 bg-black/45 p-1.5 rounded-[24px] border border-white/10 shadow-inner grid gap-1.5 w-full justify-items-stretch", gridColsClass)}>
                      {activeFormats.map(f => (
                        <button
                          key={f.value}
                          onClick={() => handleFormatChange(f.value)}
                          className={cn(
                            "relative py-3.5 px-0.5 rounded-[16px] font-extrabold text-[10px] transition-colors tracking-wide outline-none w-full text-center cursor-pointer flex items-center justify-center min-w-0 font-mono",
                            targetFormat === f.value
                              ? "text-white"
                              : "text-white/55 hover:text-white/95"
                          )}
                        >
                          {targetFormat === f.value && (
                            <motion.div
                              layoutId="active-format-pill"
                              className="absolute inset-0 bg-white/15 border border-white/20 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-md"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 uppercase leading-none font-bold">{f.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Error display */}
              {error && (
                <div className="text-red-300 text-xs bg-red-500/20 border border-red-500/30 p-3 rounded-xl px-4 font-semibold font-sans leading-relaxed">
                  {error}
                </div>
              )}

              {/* Progress Bar Container for active transcoding */}
              {isConverting && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-black/40 border border-white/10 rounded-[24px] p-5 space-y-3.5 relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-white/70 font-semibold flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                      {file?.type.startsWith('video/') ? "Transcoding Video Canvas..." : "Synthesizing output format..."}
                    </span>
                    <span className="text-indigo-300 font-extrabold font-mono bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px]">
                      {progress}%
                    </span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-3.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative p-[2px]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)] animate-pulse"
                      style={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 100, damping: 18 }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-white/40 font-sans tracking-wide">
                    <span className="font-medium">Direct Sandbox Transcoder</span>
                    <span className="font-medium">Remain on this tab</span>
                  </div>
                </motion.div>
              )}
 
              {/* Download / Convert Action */}
              <div className="pt-2">
                {!convertedUrl ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="w-full py-[18px] px-6 rounded-[28px] bg-indigo-600/80 backdrop-blur-xl text-white font-bold text-lg border border-indigo-400/40 hover:bg-indigo-600/90 shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all overflow-hidden flex items-center justify-center gap-3 disabled:opacity-70 group/btn relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover/btn:animate-[shimmer_2s_infinite]" />
                    {isConverting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                        <span className="relative z-10 font-sans">
                          {file?.type.startsWith('video/') ? `Transcoding (${progress}%)` : `Converting (${progress}%)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10 font-sans">Convert Now</span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.a
                    href={convertedUrl}
                    download={convertedFileName!}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="w-full py-[18px] px-6 rounded-[28px] bg-emerald-500/20 backdrop-blur-xl shadow-[0_15px_30px_-5px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 font-bold text-lg transition-all overflow-hidden flex items-center justify-center gap-3 relative group/btn cursor-pointer font-sans"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover/btn:animate-[shimmer_2s_infinite]" />
                    <Download className="w-5 h-5 flex-shrink-0 relative z-10" />
                    <span className="truncate max-w-[80%] relative z-10">Download {convertedFileName}</span>
                  </motion.a>
                )}
              </div>

              {/* Dynamic Compatibility Warning for Video output formats */}
              {file?.type.startsWith('video/') && ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(targetFormat) && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-indigo-500/10 border border-indigo-500/20 rounded-[24px] p-4 text-xs text-white/75 space-y-2 shadow-sm"
                >
                  <p className="font-bold text-indigo-300 flex items-center gap-1.5 font-sans">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    Player Compatibility Advisory
                  </p>
                  <p className="leading-relaxed font-sans">
                    Browser-based modern transcoders encode audio tracks using the highly efficient <strong className="text-white">Opus audio codec</strong>. Some default operating system players (e.g. Windows Films & TV) do not support Opus playback natively in an MP4 or AVI wrapper.
                  </p>
                  <div className="bg-black/25 p-2.5 rounded-[12px] border border-white/5 font-sans leading-relaxed text-indigo-200/90">
                    <span className="font-bold text-white mr-1">✨ Playback Tip:</span> 
                    For flawless sound, play your downloaded files in standard web browsers (such as Chrome, Edge), <strong className="text-white">VLC Media Player</strong>, or upload and review them anywhere!
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 100% Client-Side Privacy Pledge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 sm:p-6 flex items-start gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 relative z-10">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 text-left relative z-10">
          <span className="text-white font-bold text-sm">100% Private Client-Side Conversions</span>
          <p className="text-white/60 text-xs leading-relaxed font-medium">
            Your privacy is our priority. All media formats are transformed instantly inside your web browser. 
            Files and metadata never leave your computer and are never uploaded to any remote server or stored. Safe, fast, and completely offline.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

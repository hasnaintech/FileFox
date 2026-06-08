import { PDFDocument } from 'pdf-lib';

export type SupportedFormat = 'png' | 'jpeg' | 'webp' | 'pdf' | 'gif' | 'bmp' | 'ico' | 'tiff' | 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv';

function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function processCanvas(img: HTMLImageElement, mimeType: string, quality = 0.9): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas ctx null'));

    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      quality
    );
  });
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Extract the first frame of a video file for static image conversion
 */
export function extractVideoFrame(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.0;
    
    // Auto-timeout in case seek takes too long (e.g. corruption)
    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Timeout extracting frame from video'));
    }, 8000);

    video.onseeked = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas ctx null');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const frameUrl = canvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ img, url: frameUrl });
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load extracted frame image'));
        };
        img.src = frameUrl;
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file to extract frame'));
    };
  });
}

/**
 * Convert a static image to a micro video clip (slideshow style)
 */
export function convertImageToVideo(file: File, toFormat: 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv', quality = 0.9, onProgress?: (percent: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 640;
        canvas.height = img.height || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas layout failed');
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const fps = 30;
        const stream = canvas.captureStream(fps);
        
        // Add a silent audio track using Web Audio API to prevent codecs/audio mismatches on players
        let combinedStream = stream;
        let audioCtx: AudioContext | null = null;
        let destNode: MediaStreamAudioDestinationNode | null = null;
        try {
          const audioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioCtx = new audioContextClass();
          destNode = audioCtx.createMediaStreamDestination();
          
          if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
          }

          const composite = new MediaStream();
          stream.getVideoTracks().forEach(t => composite.addTrack(t));
          destNode.stream.getAudioTracks().forEach(t => composite.addTrack(t));
          combinedStream = composite;
        } catch (e) {
          console.warn('Silent audio creation failed for image-to-video:', e);
        }

        let mimeType = 'video/webm';
        let preferredTypes: string[] = [];
        if (toFormat === 'webm') {
          preferredTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mp4') {
          preferredTypes = [
            'video/mp4;codecs=h264,aac',
            'video/mp4;codecs=h264,mp3',
            'video/mp4;codecs=h264,opus',
            'video/mp4',
            'video/webm;codecs=h264,aac',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mov') {
          preferredTypes = [
            'video/quicktime;codecs=h264,aac',
            'video/quicktime',
            'video/mp4;codecs=h264,aac',
            'video/mp4',
            'video/webm;codecs=h264,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mkv') {
          preferredTypes = [
            'video/x-matroska;codecs=h264,opus',
            'video/x-matroska;codecs=h264,aac',
            'video/x-matroska',
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        } else if (toFormat === 'avi') {
          preferredTypes = [
            'video/vnd.avi',
            'video/avi',
            'video/msvideo',
            'video/mp4;codecs=h264,aac',
            'video/webm'
          ];
        } else {
          preferredTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        }

        const supported = preferredTypes.find(t => MediaRecorder.isTypeSupported(t));
        mimeType = supported || 'video/webm';

        const options: MediaRecorderOptions = {
          mimeType,
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        };
        
        const mediaRecorder = new MediaRecorder(combinedStream, options);
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          if (onProgress) {
            onProgress(100);
          }
          const outputBlob = new Blob(chunks, { type: mimeType });
          URL.revokeObjectURL(url);
          if (audioCtx) {
            audioCtx.close().catch(() => {});
          }
          resolve(outputBlob);
        };
        
        mediaRecorder.start();
        
        let framesCount = 0;
        const maxFrames = 60; // 2 seconds video
        const intervalId = setInterval(() => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          framesCount++;
          if (onProgress) {
            const pct = Math.min(99, Math.round((framesCount / maxFrames) * 100));
            onProgress(pct);
          }
          if (framesCount >= maxFrames) {
            clearInterval(intervalId);
            mediaRecorder.stop();
          }
        }, 1000 / fps);
        
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for video conversion'));
    };
  });
}

/**
 * Transcode or convert video file to another format client-side using Canvas + Audio + MediaRecorder
 */
export function convertVideoToVideo(file: File, toFormat: 'mp4' | 'webm' | 'mov' | 'avi' | 'mkv', quality = 0.9, onProgress?: (percent: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = false; // Capture audio internally
    video.playsInline = true;
    video.controls = false;
    
    // Create AudioContext synchronously inside the user gesture to permanently authorize it
    const audioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    let audioCtx: AudioContext | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;
    let destNode: MediaStreamAudioDestinationNode | null = null;

    try {
      audioCtx = new audioContextClass();
      sourceNode = audioCtx.createMediaElementSource(video);
      destNode = audioCtx.createMediaStreamDestination();
      sourceNode.connect(destNode);
      // DO NOT connect sourceNode to audioCtx.destination. This guarantees user silence.
    } catch (e) {
      console.warn('Silent AudioContext creation failed synchronously:', e);
    }

    // Fallback safe timeout before metadata is loaded
    let activeTimeoutId = setTimeout(() => {
      URL.revokeObjectURL(url);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      reject(new Error('Transcoding took too long or was blockaded'));
    }, 600000); // 10 minutes fallback if metadata never loads

    video.onloadedmetadata = async () => {
      // Clear initial fallback timeout
      clearTimeout(activeTimeoutId);

      // Dynamically calculate timeout based on video duration
      // Duration + 15 seconds padding, minimum 45 seconds to operate
      const duration = video.duration || 10;
      const dynamicTimeoutMs = Math.max(45000, (duration * 1000) + 15000);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas ctx not loaded');

        const fps = 30;
        const stream = canvas.captureStream(fps);

        // Mix visual and audio streams from Canvas and destination Web Audio nodes
        let combinedStream = stream;
        if (destNode) {
          const composite = new MediaStream();
          stream.getVideoTracks().forEach(t => composite.addTrack(t));
          destNode.stream.getAudioTracks().forEach(t => composite.addTrack(t));
          combinedStream = composite;
        }

        // Resume AudioContext just before triggering gameplay to confirm audio flow
        if (audioCtx && audioCtx.state === 'suspended') {
          await audioCtx.resume().catch((err) => console.warn('AudioContext failed to resume:', err));
        }

        let mimeType = 'video/webm';
        let preferredTypes: string[] = [];
        if (toFormat === 'webm') {
          preferredTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mp4') {
          preferredTypes = [
            'video/mp4;codecs=h264,aac',
            'video/mp4;codecs=h264,mp3',
            'video/mp4;codecs=h264,opus',
            'video/mp4',
            'video/webm;codecs=h264,aac',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mov') {
          preferredTypes = [
            'video/quicktime;codecs=h264,aac',
            'video/quicktime',
            'video/mp4;codecs=h264,aac',
            'video/mp4',
            'video/webm;codecs=h264,opus',
            'video/webm'
          ];
        } else if (toFormat === 'mkv') {
          preferredTypes = [
            'video/x-matroska;codecs=h264,opus',
            'video/x-matroska;codecs=h264,aac',
            'video/x-matroska',
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        } else if (toFormat === 'avi') {
          preferredTypes = [
            'video/vnd.avi',
            'video/avi',
            'video/msvideo',
            'video/mp4;codecs=h264,aac',
            'video/webm'
          ];
        } else {
          preferredTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm'
          ];
        }

        const supported = preferredTypes.find(t => MediaRecorder.isTypeSupported(t));
        mimeType = supported || 'video/webm';

        const options: MediaRecorderOptions = {
          mimeType,
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        };

        const mediaRecorder = new MediaRecorder(combinedStream, options);
        const chunks: Blob[] = [];
        
        // Setup dynamic transcoding timeout abort
        activeTimeoutId = setTimeout(() => {
          try {
            mediaRecorder.stop();
          } catch (e) {}
          URL.revokeObjectURL(url);
          if (audioCtx) {
            audioCtx.close().catch(() => {});
          }
          reject(new Error('Transcoding took too long or was blockaded'));
        }, dynamicTimeoutMs);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          clearTimeout(activeTimeoutId);
          if (onProgress) {
            onProgress(100);
          }
          const outputBlob = new Blob(chunks, { type: mimeType });
          URL.revokeObjectURL(url);
          if (audioCtx) {
            audioCtx.close().catch(() => {});
          }
          resolve(outputBlob);
        };

        mediaRecorder.start();
        
        // play the video silently
        video.play().then(() => {
          // Confirm canvas draw loop renders successfully
        }).catch(err => {
          console.warn("Autoplay block detected, retrying playback with video.muted = true as absolute fallback", err);
          // If we fail to play with audio due to an overzealous browser autoplay engine
          video.muted = true;
          video.play().catch(fatal => {
            clearTimeout(activeTimeoutId);
            reject(new Error('Autoplay blocker prevented video playback: ' + fatal.message));
          });
        });

        let animationFrameId: number;
        const drawFrame = () => {
          if (video.paused || video.ended) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          if (onProgress && video.duration) {
            const pct = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
            onProgress(pct);
          }

          animationFrameId = requestAnimationFrame(drawFrame);
        };

        video.onplay = () => {
          drawFrame();
        };

        video.onended = () => {
          mediaRecorder.stop();
          cancelAnimationFrame(animationFrameId);
        };

        video.onerror = () => {
          clearTimeout(activeTimeoutId);
          mediaRecorder.stop();
          cancelAnimationFrame(animationFrameId);
          reject(new Error('Video transcoding error'));
        };

      } catch (err) {
        clearTimeout(activeTimeoutId);
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(activeTimeoutId);
      URL.revokeObjectURL(url);
      reject(new Error('Failed to parse input video metadata'));
    };
  });
}

/**
 * Safe multi-format converter function capable of handling both images and videos
 */
export async function convertImage(
  file: File, 
  toFormat: SupportedFormat, 
  quality = 0.9,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const isVideoFile = file.type.startsWith('video/');

  if (isVideoFile) {
    // If output is also a video format
    if (toFormat === 'mp4' || toFormat === 'webm' || toFormat === 'mov' || toFormat === 'avi' || toFormat === 'mkv') {
      return convertVideoToVideo(file, toFormat, quality, onProgress);
    }
    
    // Extract first frame and pipe through image converter for image format targets!
    const { img, url: frameUrl } = await extractVideoFrame(file);
    try {
      if (toFormat === 'pdf') {
        const imageBlob = await processCanvas(img, 'image/png', quality);
        const imageBytes = await blobToArrayBuffer(imageBlob);
        const pdfDoc = await PDFDocument.create();
        const pdfImage = await pdfDoc.embedPng(imageBytes);
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }

      const mimeType = toFormat === 'ico' ? 'image/x-icon' : `image/${toFormat}`;
      const blob = await processCanvas(img, mimeType, quality);
      return blob;
    } finally {
      URL.revokeObjectURL(frameUrl);
    }
  }

  // If input file is an image file
  if (toFormat === 'mp4' || toFormat === 'webm' || toFormat === 'mov' || toFormat === 'avi' || toFormat === 'mkv') {
    return convertImageToVideo(file, toFormat, quality, onProgress);
  }

  // Classic image-to-image/pdf pipelines
  const { img, url } = await loadImage(file);
  try {
    if (toFormat === 'pdf') {
      const pdfImageFormat = file.type === 'image/jpeg' ? 'jpeg' : 'png';
      const imageBlob = await processCanvas(img, `image/${pdfImageFormat}`, quality);
      const imageBytes = await blobToArrayBuffer(imageBlob);

      const pdfDoc = await PDFDocument.create();
      let pdfImage;
      if (pdfImageFormat === 'jpeg') {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      }

      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    }

    const mimeType = toFormat === 'ico' ? 'image/x-icon' : `image/${toFormat}`;
    const blob = await processCanvas(img, mimeType, quality);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get base64 without prefix
        const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        onCapture(base64);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-slate-800">
          <h3 className="text-white font-semibold">Capture Problem</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-6 flex justify-center gap-6 bg-slate-900">
           <button 
             onClick={() => { stopCamera(); startCamera(); }}
             className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-all border border-slate-600"
             title="Switch/Restart Camera"
           >
             <RefreshCw size={24} />
           </button>
           
           <button 
             onClick={handleCapture}
             className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30"
             title="Take Photo"
           >
             <Camera size={32} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
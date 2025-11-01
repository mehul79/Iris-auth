'use client';

import { useState, useRef, useEffect } from 'react';

interface IrisCaptureProps {
  onCapture: (irisData: string) => void;
  onCancel: () => void;
}

export default function IrisCapture({ onCapture, onCancel }: IrisCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout;
    
    if (capturing && countdown > 0) {
      countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (capturing && countdown === 0) {
      captureIris();
    }
    
    return () => {
      if (countdownTimer) clearTimeout(countdownTimer);
    };
  }, [capturing, countdown]);

  const startCapture = async () => {
    try {
      // TODO: Replace with real iris SDK initialization
      // For now, just simulate camera access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCapturing(true);
      setCountdown(3);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const captureIris = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg');
    const base64Data = imageData.split(',')[1];
    
    // Stop video stream
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // TODO: Add legal consent collection for biometric data
    
    // Call onCapture with the iris data
    onCapture(base64Data);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 bg-black rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {capturing && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white text-6xl font-bold rounded-full w-24 h-24 flex items-center justify-center">
              {countdown}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        
        {!capturing && (
          <button
            onClick={startCapture}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Start Capture
          </button>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        Position your eye in front of the camera and remain still during capture.
      </p>
    </div>
  );
}
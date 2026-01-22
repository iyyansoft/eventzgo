"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/library";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    let isMounted = true;
    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        // Get available video devices
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setCameraError("No camera found on this device");
          return;
        }

        // Prefer back camera on mobile devices
        const selectedDeviceId = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        )?.deviceId || videoInputDevices[0].deviceId;

        // Start decoding from video device
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result && isMounted && isScanning) {
              const text = result.getText();
              if (text) {
                setIsScanning(false);
                onScan(text);
              }
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('QR Scanner Error:', error);
            }
          }
        );
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(err.message || "Failed to access camera");
        if (onError) {
          onError(err);
        }
      }
    };

    startScanning();

    return () => {
      isMounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onScan, onError, isScanning]);

  return (
    <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-white text-sm mb-4">{cameraError}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Close Scanner
          </button>
        </div>
      ) : (
        <>
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            
            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>

          {/* Cancel button */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500/90 text-white rounded-lg backdrop-blur-sm hover:bg-red-600 transition-colors"
            >
              Cancel Scan
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes scan {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
}

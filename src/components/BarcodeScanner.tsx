import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        // We might want to stop after a scan, but usually POS keeps it going
      },
      (error) => {
        // Handle scan failure, usually silent
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Visual Scanner</h3>
            <p className="text-xs text-gray-400">Position the barcode within the frame below.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 aspect-video"></div>
        
        <div className="flex justify-center pt-2">
           <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Ready to process input
           </div>
        </div>
      </motion.div>
    </div>
  );
}

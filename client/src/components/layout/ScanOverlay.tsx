import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useScanner } from "@/hooks/useScanner";

export default function ScanOverlay() {
  const { isOpen, context, closeScanner, processScan } = useScanner();
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleProcessScan = async () => {
    if (!manualInput.trim()) return;
    
    setIsProcessing(true);
    try {
      await processScan(manualInput.trim());
      setManualInput("");
      closeScanner();
    } catch (error) {
      console.error("Scan processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleProcessScan();
    }
  };

  const getContextDisplayName = (context: string) => {
    switch (context) {
      case "sku":
        return "SKU";
      case "bin":
        return "Bin Location";
      case "tote":
        return "Tote ID";
      case "AWB":
        return "AWB Number";
      default:
        return "Barcode";
    }
  };

  const getContextPlaceholder = (context: string) => {
    switch (context) {
      case "sku":
        return "Enter SKU code...";
      case "bin":
        return "Enter bin location (e.g., A-12-03)...";
      case "tote":
        return "Enter tote ID...";
      case "AWB":
        return "Enter AWB number...";
      default:
        return "Enter barcode manually...";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeScanner}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <i className="fas fa-qrcode mr-2 text-primary-500"></i>
            Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Camera Preview Area */}
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-camera text-4xl text-secondary-300 mb-4"></i>
              <p className="text-secondary-500">Camera view would appear here</p>
              <p className="text-sm text-secondary-400">
                Scanning for: {getContextDisplayName(context)}
              </p>
            </div>
          </div>
          
          {/* Manual Input Option */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="manual-scan" className="text-sm font-medium text-secondary-700">
                Manual Input
              </Label>
              <Input
                id="manual-scan"
                ref={inputRef}
                type="text"
                placeholder={getContextPlaceholder(context)}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-2"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleProcessScan}
                disabled={!manualInput.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  "Process Scan"
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={closeScanner}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

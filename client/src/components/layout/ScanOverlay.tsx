import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useScanner } from "@/hooks/useScanner";
import { QrCode, Camera, Loader2 } from "lucide-react";

interface ScanOverlayProps {
  context?: string;
}

export function ScanOverlay({ context: propContext }: ScanOverlayProps) {
  const { isOpen, context: hookContext, closeScanner, processScan } = useScanner();
  const context = propContext || hookContext;
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((isOpen || (propContext && localOpen)) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, propContext, localOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleClose = () => {
    setLocalOpen(false);
    setManualInput("");
    closeScanner();
  };

  const handleProcessScan = async () => {
    if (!manualInput.trim()) return;
    
    setIsProcessing(true);
    try {
      await processScan(manualInput.trim());
      setManualInput("");
      handleClose();
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

  // Show overlay when hook indicates open (opened via useScanner)
  // Do NOT auto-show for propContext - only show when explicitly opened
  const shouldShow = isOpen;

  return (
    <Dialog open={shouldShow} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <QrCode className="mr-2 h-4 w-4 text-primary-500" />
            Scanner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Camera Preview Area */}
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <Camera className="mx-auto mb-4 h-12 w-12 text-secondary-300" />
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Scan"
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleClose}
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

export default ScanOverlay;

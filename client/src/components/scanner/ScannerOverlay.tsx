import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X, Camera, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ScannerOverlayProps {
  onClose: () => void;
}

export function ScannerOverlay({ onClose }: ScannerOverlayProps) {
  const [location] = useLocation();
  const [manualInput, setManualInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getScanContext = () => {
    if (location.includes("inventory") || location.includes("picking")) return "sku";
    if (location.includes("packing")) return "tote";
    if (location.includes("dispatch")) return "awb";
    if (location.includes("inbound")) return "bin";
    return "general";
  };

  const context = getScanContext();

  const getContextClass = () => {
    switch (context) {
      case "sku": return "scanner-context-sku";
      case "tote": return "scanner-context-tote";
      case "awb": return "scanner-context-awb";
      case "bin": return "scanner-context-bin";
      default: return "";
    }
  };

  const handleScan = async () => {
    if (!manualInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a code to scan",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiRequest("/api/scan", {
        method: "POST",
        body: JSON.stringify({
          code: manualInput.trim(),
          context
        })
      });

      if (response.success) {
        toast({
          title: "Scan Successful",
          description: `${context.toUpperCase()} ${manualInput} processed successfully`,
        });
        onClose();
      } else {
        throw new Error("Scan failed");
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Failed to process scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  useEffect(() => {
    // Auto-focus the input
    const input = document.getElementById("manualScanInput");
    if (input) {
      input.focus();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 saylogix-scanner-overlay">
      <Card className={`max-w-md w-full mx-4 ${getContextClass()}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-blue-600" />
            Scanner
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Camera Preview Area */}
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Camera view would appear here</p>
              <p className="text-sm text-gray-400">
                Scanning for: <span className="font-medium uppercase">{context}</span>
              </p>
            </div>
          </div>

          {/* Manual Input Option */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="manualScanInput" className="text-sm font-medium">
                Manual Input
              </Label>
              <Input
                id="manualScanInput"
                type="text"
                placeholder={`Enter ${context} manually...`}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="mt-2"
              />
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleScan}
                disabled={isProcessing}
                className="flex-1 saylogix-primary"
              >
                {isProcessing ? "Processing..." : "Process Scan"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

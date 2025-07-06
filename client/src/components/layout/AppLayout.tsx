import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { ScannerOverlay } from "../scanner/ScannerOverlay";
import { MyTasks } from "../dashboard/MyTasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, AlertTriangle } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onScanClick={() => setIsScannerOpen(true)} />
        
        {showAlert && (
          <Alert className="saylogix-alert-banner rounded-none border-x-0 border-t-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>System Alert:</strong> 3 orders require address verification. 2 courier assignments pending.
            </AlertDescription>
            <button 
              onClick={() => setShowAlert(false)}
              className="absolute right-4 top-4 text-amber-600 hover:text-amber-800"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      
      <MyTasks />
      
      {isScannerOpen && (
        <ScannerOverlay onClose={() => setIsScannerOpen(false)} />
      )}
    </div>
  );
}

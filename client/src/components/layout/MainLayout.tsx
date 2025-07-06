import { ReactNode } from "react";
import SidebarMenu from "./SidebarMenu";
import TopNavBar from "./TopNavBar";
import AlertsBanner from "./AlertsBanner";
import MyTasks from "./MyTasks";
import ScanOverlay from "./ScanOverlay";
import { useWebSocket } from "@/hooks/useWebSocket";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar />
        <AlertsBanner />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
        
        <MyTasks />
      </div>
      
      <ScanOverlay />
    </div>
  );
}

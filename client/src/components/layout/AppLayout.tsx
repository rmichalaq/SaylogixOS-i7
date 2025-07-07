import { ReactNode } from "react";
import SidebarMenu from "./SidebarMenu";
import TopNavBar from "./TopNavBar";
import AlertsBanner from "./AlertsBanner";
import MyTasks from "./MyTasks";
import ScanOverlay from "./ScanOverlay";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="layout-container bg-gray-50">
      <SidebarMenu />
      
      <div className="main-content">
        <TopNavBar />
        <AlertsBanner />
        
        <main className="content-area">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      
      <MyTasks />
      <ScanOverlay />
    </div>
  );
}

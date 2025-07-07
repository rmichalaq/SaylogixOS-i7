import { ReactNode } from "react";
import SidebarMenu from "./SidebarMenu";
import TopNavBar from "./TopNavBar";
import AlertsBanner from "./AlertsBanner";
import MyTasks from "./MyTasks";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SidebarMenu />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopNavBar />
        <AlertsBanner />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <MyTasks />
    </div>
  );
}

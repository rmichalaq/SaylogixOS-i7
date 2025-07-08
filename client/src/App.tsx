import { BrowserRouter, useRoutes, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider } from "@/context/SidebarContext";
import { screens, type ScreenConfig } from "@/config/screens";
import SidebarMenu from "@/components/layout/SidebarMenu";
import TopNavBar from "@/components/layout/TopNavBar";
import AlertsBanner from "@/components/layout/AlertsBanner";
import MyTasks from "@/components/layout/MyTasks";
import ScanOverlay from "@/components/layout/ScanOverlay";

function AppRoutes() {
  const routes = screens.flatMap(screen => {
    const Component = screen.component;
    const mainRoute = { path: screen.path, element: <Component /> };
    
    if (screen.children) {
      const childRoutes = screen.children.map(child => {
        const ChildComponent = child.component;
        return {
          path: child.path,
          element: <ChildComponent />
        };
      });
      return [mainRoute, ...childRoutes];
    }
    
    return [mainRoute];
  });

  // Add root route to redirect to dashboard
  const DashboardComponent = screens[0].component;
  routes.unshift({ path: "/", element: <DashboardComponent /> });

  return useRoutes(routes);
}

function App() {

  return (
    <div className="layout-container bg-gray-50">
      <SidebarMenu />
      <div className="main-content">
        <TopNavBar />
        <AlertsBanner />
        <main className="content-area">
          <AppRoutes />
        </main>
        <ScanOverlay />
      </div>
      <MyTasks />
    </div>
  );
}

function AppWithProviders() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default AppWithProviders;

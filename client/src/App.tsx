import { Router, useLocation, Route, Switch } from "wouter";
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
  return (
    <Switch>
      {screens.map(screen => {
        const Component = screen.component;
        return <Route key={screen.path} path={screen.path} component={Component} />;
      })}
      <Route path="/" component={screens[0].component} />
    </Switch>
  );
}

function App() {
  return (
    <Router>
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
      </div>
    </Router>
  );
}

function AppWithProviders() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <App />
        <Toaster />
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default AppWithProviders;

import { Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SidebarProvider } from "@/context/SidebarContext";
import TestDashboard from "@/pages/TestDashboard";
import Dashboard from "@/pages/Dashboard";
import OrdersPage from "@/pages/orders/OrdersPage";
import VerifyPage from "@/pages/AddressVerify";
import InventoryPage from "@/pages/inventory/InventoryPage";
import InboundPage from "@/pages/Inbound";
import PickingPage from "@/pages/picking/PickingPage";
import PackingPage from "@/pages/packing/PackingPage";
import DispatchPage from "@/pages/dispatch/DispatchPage";
import LastMilePage from "@/pages/lastmile/LastMilePage";
import TrackingPage from "@/pages/tracking/TrackingPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import NotFoundPage from "@/pages/not-found";

function App() {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <Router>
          <AppLayout>
            <Route path="/" component={TestDashboard} />
            <Route path="/dashboard" component={TestDashboard} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/verify" component={VerifyPage} />
            <Route path="/inventory" component={InventoryPage} />
            <Route path="/inventory/view" component={InventoryPage} />
            <Route path="/inventory/adjust" component={InventoryPage} />
            <Route path="/inventory/cycle-count" component={InventoryPage} />
            <Route path="/inbound" component={InboundPage} />
            <Route path="/picking" component={PickingPage} />
            <Route path="/packing" component={PackingPage} />
            <Route path="/dispatch" component={DispatchPage} />
            <Route path="/lastmile" component={LastMilePage} />
            <Route path="/tracking" component={TrackingPage} />
            <Route path="/reports" component={ReportsPage} />
            <Route path="/reports/operations" component={ReportsPage} />
            <Route path="/reports/courier-performance" component={ReportsPage} />
            <Route path="/reports/returns" component={ReportsPage} />
            <Route path="/reports/address-quality" component={ReportsPage} />
            <Route path="/reports/exceptions" component={ReportsPage} />
            <Route component={NotFoundPage} />
          </AppLayout>
          <Toaster />
        </Router>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default App;

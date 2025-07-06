import { Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
      <Router>
        <AppLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/verify" component={VerifyPage} />
          <Route path="/inventory" component={InventoryPage} />
          <Route path="/inbound" component={InboundPage} />
          <Route path="/picking" component={PickingPage} />
          <Route path="/packing" component={PackingPage} />
          <Route path="/dispatch" component={DispatchPage} />
          <Route path="/lastmile" component={LastMilePage} />
          <Route path="/tracking" component={TrackingPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route component={NotFoundPage} />
        </AppLayout>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;

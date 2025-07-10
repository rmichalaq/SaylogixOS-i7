import DashboardRedesigned from "@/pages/DashboardRedesigned";
import OrdersPage from "@/pages/Orders";
import VerifyPage from "@/pages/AddressVerify";
import TrackingPage from "@/pages/tracking/TrackingPage";

import InventoryRedesigned from "@/pages/InventoryRedesigned";
import InboundPage from "@/pages/Inbound";
import PickingPage from "@/pages/Picking";
import PackingPage from "@/pages/Packing";
import DispatchPage from "@/pages/Dispatch";
import LastMilePage from "@/pages/LastMile";
import ReportsPage from "@/pages/Reports";
import SettingsRedesigned from "@/pages/SettingsRedesigned";
import IntegrationsRedesigned from "@/pages/IntegrationsRedesigned";
import AdminPanel from "@/pages/AdminPanel";

export interface ScreenConfig {
  path: string;
  component: any;
  label: string;
  menuGroup: string;
  scan: { enabled: boolean; context?: string };
  icon: string;
  children?: ScreenConfig[];
}

export const screens: ScreenConfig[] = [
  {
    path: "/dashboard",
    component: DashboardRedesigned,
    label: "Dashboard",
    menuGroup: "Overview",
    scan: { enabled: false },
    icon: "fas fa-home"
  },
  {
    path: "/orders",
    component: OrdersPage,
    label: "Orders",
    menuGroup: "Fulfillment",
    scan: { enabled: false },
    icon: "fas fa-shopping-cart"
  },

  {
    path: "/verify",
    component: VerifyPage,
    label: "Verify NAS",
    menuGroup: "Fulfillment",
    scan: { enabled: false },
    icon: "fas fa-map-marker-alt"
  },
  {
    path: "/tracking",
    component: TrackingPage,
    label: "Tracking",
    menuGroup: "Fulfillment",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-truck"
  },
  {
    path: "/inventory",
    component: InventoryRedesigned,
    label: "Inventory",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "sku" },
    icon: "fas fa-boxes"
  },
  {
    path: "/inbound",
    component: InboundPage,
    label: "Inbound",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "bin" },
    icon: "fas fa-arrow-down"
  },
  {
    path: "/picking",
    component: PickingPage,
    label: "Picking",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "sku" },
    icon: "fas fa-hand-paper"
  },
  {
    path: "/packing",
    component: PackingPage,
    label: "Packing",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "tote" },
    icon: "fas fa-box"
  },
  {
    path: "/dispatch",
    component: DispatchPage,
    label: "Dispatch",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-shipping-fast"
  },
  {
    path: "/lastmile",
    component: LastMilePage,
    label: "Last Mile",
    menuGroup: "Last Mile",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-route"
  },
  {
    path: "/reports",
    component: ReportsPage,
    label: "Reports",
    menuGroup: "Analytics",
    scan: { enabled: false },
    icon: "fas fa-chart-bar"
  },
  {
    path: "/integrations",
    component: IntegrationsRedesigned,
    label: "Integrations",
    menuGroup: "System",
    scan: { enabled: false },
    icon: "fas fa-plug"
  },
  {
    path: "/settings",
    component: SettingsRedesigned,
    label: "Settings",
    menuGroup: "System",
    scan: { enabled: false },
    icon: "fas fa-cog"
  },
  {
    path: "/admin",
    component: AdminPanel,
    label: "Admin Panel",
    menuGroup: "System",
    scan: { enabled: false },
    icon: "fas fa-shield-alt"
  }
];

export const getScreenByPath = (path: string): ScreenConfig | null => {
  for (const screen of screens) {
    if (screen.path === path) return screen;
    if (screen.children) {
      for (const child of screen.children) {
        if (child.path === path) return child;
      }
    }
  }
  return null;
};

export const getMenuGroups = (): Record<string, ScreenConfig[]> => {
  const groups: Record<string, ScreenConfig[]> = {};
  
  for (const screen of screens) {
    if (!groups[screen.menuGroup]) {
      groups[screen.menuGroup] = [];
    }
    groups[screen.menuGroup].push(screen);
  }

  // Sort screens within each group alphabetically
  for (const group in groups) {
    groups[group].sort((a, b) => a.label.localeCompare(b.label));
  }

  return groups;
};

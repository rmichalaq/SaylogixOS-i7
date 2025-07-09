import Dashboard from "@/pages/Dashboard";
import OrdersPage from "@/pages/OrdersRefactored";
import VerifyPage from "@/pages/AddressVerify";
import TrackingPage from "@/pages/tracking/TrackingPage";

import InventoryRedesigned from "@/pages/InventoryRedesigned";
import InboundPage from "@/pages/Inbound";
import PickingPage from "@/pages/picking/PickingPage";
import PackingPage from "@/pages/packing/PackingPage";
import DispatchPage from "@/pages/dispatch/DispatchPage";
import LastMilePage from "@/pages/lastmile/LastMilePage";
import ReportsPage from "@/pages/reports/ReportsPage";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";

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
    component: Dashboard,
    label: "Dashboard",
    menuGroup: "Overview",
    scan: { enabled: false },
    icon: "fas fa-home"
  },
  {
    path: "/orders",
    component: OrdersPage,
    label: "Orders (OMS)",
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
    label: "Dispatch (DMS)",
    menuGroup: "Dispatch",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-shipping-fast"
  },
  {
    path: "/lastmile",
    component: LastMilePage,
    label: "Last Mile (LMS)",
    menuGroup: "Dispatch",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-route"
  },
  {
    path: "/reports",
    component: ReportsPage,
    label: "Reports",
    menuGroup: "Analytics",
    scan: { enabled: false },
    icon: "fas fa-chart-bar",
    children: [
      {
        path: "/reports/operations",
        component: ReportsPage,
        label: "Operations",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-cogs"
      },
      {
        path: "/reports/courier-performance",
        component: ReportsPage,
        label: "Courier Performance",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-truck"
      },
      {
        path: "/reports/returns",
        component: ReportsPage,
        label: "Returns",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-undo"
      },
      {
        path: "/reports/address-quality",
        component: ReportsPage,
        label: "Address Quality",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-map-marked-alt"
      },
      {
        path: "/reports/exceptions",
        component: ReportsPage,
        label: "Exceptions",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-exclamation-triangle"
      }
    ]
  },
  {
    path: "/integrations",
    component: Integrations,
    label: "Integrations",
    menuGroup: "System",
    scan: { enabled: false },
    icon: "fas fa-plug"
  },
  {
    path: "/settings",
    component: Settings,
    label: "Settings",
    menuGroup: "System",
    scan: { enabled: false },
    icon: "fas fa-cog"
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

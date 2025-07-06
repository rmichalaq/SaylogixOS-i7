import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import AddressVerify from "@/pages/AddressVerify";
import Tracking from "@/pages/Tracking";
import Inventory from "@/pages/Inventory";
import Inbound from "@/pages/Inbound";
import Picking from "@/pages/Picking";
import Packing from "@/pages/Packing";
import Dispatch from "@/pages/Dispatch";
import LastMile from "@/pages/LastMile";
import Reports from "@/pages/Reports";

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
    component: Orders,
    label: "Orders (OMS)",
    menuGroup: "Fulfillment",
    scan: { enabled: false },
    icon: "fas fa-shopping-cart"
  },
  {
    path: "/verify",
    component: AddressVerify,
    label: "Address Verify (NAS)",
    menuGroup: "Fulfillment",
    scan: { enabled: false },
    icon: "fas fa-map-marker-alt"
  },
  {
    path: "/tracking",
    component: Tracking,
    label: "Tracking",
    menuGroup: "Fulfillment",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-truck"
  },
  {
    path: "/inventory",
    component: Inventory,
    label: "Inventory (WMS)",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "sku" },
    icon: "fas fa-boxes",
    children: [
      {
        path: "/inventory/view",
        component: Inventory,
        label: "View",
        menuGroup: "Warehouse",
        scan: { enabled: true, context: "sku" },
        icon: "fas fa-eye"
      },
      {
        path: "/inventory/adjust",
        component: Inventory,
        label: "Adjust",
        menuGroup: "Warehouse",
        scan: { enabled: true, context: "sku" },
        icon: "fas fa-edit"
      },
      {
        path: "/inventory/cycle-count",
        component: Inventory,
        label: "Cycle Count",
        menuGroup: "Warehouse",
        scan: { enabled: true, context: "bin" },
        icon: "fas fa-clipboard-check"
      },
      {
        path: "/inventory/expiry-report",
        component: Inventory,
        label: "Expiry Report",
        menuGroup: "Warehouse",
        scan: { enabled: false },
        icon: "fas fa-calendar-times"
      }
    ]
  },
  {
    path: "/inbound",
    component: Inbound,
    label: "Inbound",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "bin" },
    icon: "fas fa-arrow-down"
  },
  {
    path: "/picking",
    component: Picking,
    label: "Picking",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "sku" },
    icon: "fas fa-hand-paper"
  },
  {
    path: "/packing",
    component: Packing,
    label: "Packing",
    menuGroup: "Warehouse",
    scan: { enabled: true, context: "tote" },
    icon: "fas fa-box"
  },
  {
    path: "/dispatch",
    component: Dispatch,
    label: "Dispatch (DMS)",
    menuGroup: "Dispatch",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-shipping-fast"
  },
  {
    path: "/lastmile",
    component: LastMile,
    label: "Last Mile (LMS)",
    menuGroup: "Dispatch",
    scan: { enabled: true, context: "AWB" },
    icon: "fas fa-route"
  },
  {
    path: "/reports",
    component: Reports,
    label: "Reports",
    menuGroup: "Analytics",
    scan: { enabled: false },
    icon: "fas fa-chart-bar",
    children: [
      {
        path: "/reports/operations",
        component: Reports,
        label: "Operations",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-cogs"
      },
      {
        path: "/reports/courier-performance",
        component: Reports,
        label: "Courier Performance",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-truck"
      },
      {
        path: "/reports/returns",
        component: Reports,
        label: "Returns",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-undo"
      },
      {
        path: "/reports/address-quality",
        component: Reports,
        label: "Address Quality",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-map-marked-alt"
      },
      {
        path: "/reports/exceptions",
        component: Reports,
        label: "Exceptions",
        menuGroup: "Analytics",
        scan: { enabled: false },
        icon: "fas fa-exclamation-triangle"
      }
    ]
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

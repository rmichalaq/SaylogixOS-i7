import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Home, ShoppingCart, MapPin, Truck, Package, ArrowDown, 
  Hand, Box, FastForward, Route, BarChart3, Settings,
  ChevronRight, Ungroup
} from "lucide-react";

const menuItems = [
  {
    section: "main",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: Home }
    ]
  },
  {
    section: "Fulfillment",
    items: [
      { path: "/orders", label: "Orders", icon: ShoppingCart },
      { path: "/verify", label: "Verify NAS", icon: MapPin },
      { path: "/tracking", label: "Tracking", icon: Truck }
    ]
  },
  {
    section: "Warehouse",
    items: [
      { path: "/inbound", label: "Inbound", icon: ArrowDown },
      { path: "/inventory", label: "Inventory", icon: Package, hasSubmenu: true },
      { path: "/picking", label: "Picking", icon: Hand },
      { path: "/packing", label: "Packing", icon: Box },
      { path: "/dispatch", label: "Dispatch", icon: FastForward }
    ]
  },
  {
    section: "Last Mile",
    items: [
      { path: "/lastmile", label: "Last Mile", icon: Route }
    ]
  },
  {
    section: "Analytics",
    items: [
      { path: "/reports", label: "Reports", icon: BarChart3 }
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 saylogix-sidebar flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 saylogix-primary rounded-lg flex items-center justify-center">
            <Ungroup className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-700">SaylogixOS</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((section) => (
          <div key={section.section} className="px-4 mb-4">
            {section.section !== "main" && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.section}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`saylogix-nav-item ${isActive ? 'active' : 'text-gray-600 hover:bg-gray-100'}`}>
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                      {item.hasSubmenu && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 saylogix-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">System Admin</p>
            <p className="text-xs text-gray-500 truncate">Warehouse Manager</p>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

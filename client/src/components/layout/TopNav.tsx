import { useLocation } from "wouter";
import { Search, QrCode, Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavProps {
  onScanClick: () => void;
}

export function TopNav({ onScanClick }: TopNavProps) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/orders": "Orders",
      "/verify": "Verify NAS",
      "/inventory": "Inventory",
      "/inbound": "Inbound",
      "/picking": "Picking",
      "/packing": "Packing",
      "/dispatch": "Dispatch",
      "/lastmile": "Last Mile",
      "/tracking": "Tracking",
      "/reports": "Reports"
    };
    return titles[location] || "Dashboard";
  };

  const getBreadcrumb = () => {
    if (location === "/" || location === "/dashboard") {
      return "Home / Dashboard";
    }
    return `Home / ${getPageTitle()}`;
  };

  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Title and breadcrumb */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-700">{getPageTitle()}</h1>
        <nav className="text-sm text-gray-500">
          {getBreadcrumb()}
        </nav>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        {/* Global Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search orders, SKUs, AWBs..."
            className="w-80 pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        </div>

        {/* Scan Button */}
        <Button onClick={onScanClick} className="saylogix-primary">
          <QrCode className="h-4 w-4 mr-2" />
          Scan
        </Button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-700">
            <div className="w-8 h-8 saylogix-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">SA</span>
            </div>
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </header>
  );
}

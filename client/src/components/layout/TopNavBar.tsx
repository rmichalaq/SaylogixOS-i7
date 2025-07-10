import { useLocation } from "wouter";
import { getScreenByPath } from "@/config/screens";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/context/SidebarContext";
import { useScanner } from "@/hooks/useScanner";
import { 
  Menu,
  Search,
  QrCode,
  Bell,
  ChevronDown
} from "lucide-react";

export default function TopNavBar() {
  const [location] = useLocation();
  const currentScreen = getScreenByPath(location);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleSidebar } = useSidebar();
  const { openScanner } = useScanner();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Searching for:", searchQuery);
  };

  const getBreadcrumb = () => {
    const pathname = location;
    if (pathname === "/" || pathname === "/dashboard") {
      return "Home / Dashboard";
    }
    
    const pathParts = pathname.split("/").filter(Boolean);
    const breadcrumbs = ["Home"];
    
    pathParts.forEach((part, index) => {
      const partPath = "/" + pathParts.slice(0, index + 1).join("/");
      const screen = getScreenByPath(partPath);
      if (screen) {
        breadcrumbs.push(screen.label);
      } else {
        breadcrumbs.push(part.charAt(0).toUpperCase() + part.slice(1));
      }
    });
    
    return breadcrumbs.join(" / ");
  };

  const getPageTitle = () => {
    const pathname = location.pathname;
    if (pathname === "/" || pathname === "/dashboard") {
      return "Dashboard";
    }
    return currentScreen?.label || "Page";
  };

  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Mobile menu button + Title and breadcrumb */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col">
          <h1 className="text-lg lg:text-xl font-semibold text-secondary-700">
            {getPageTitle()}
          </h1>
          <nav className="text-xs lg:text-sm text-secondary-500 hidden sm:block">
            {getBreadcrumb()}
          </nav>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Global Search - Hide on mobile */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search orders, SKUs, AWBs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-80 pl-10 pr-4"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-secondary-400" />
        </form>

        {/* Search icon for mobile */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => {
            // Toggle mobile search
            console.log("Toggle mobile search");
          }}
        >
          <Search className="h-4 w-4" />
        </Button>

        

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => {
            // Toggle notifications panel
            console.log("Toggle notifications");
          }}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium z-10">
            3
          </span>
        </Button>

        {/* User Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => {
              // Toggle user menu
              console.log("Toggle user menu");
            }}
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">SA</span>
            </div>
            <ChevronDown className="h-3 w-3 hidden lg:inline" />
          </Button>
        </div>
      </div>
    </header>
  );
}

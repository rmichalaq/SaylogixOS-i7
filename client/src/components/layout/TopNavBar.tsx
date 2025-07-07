import { useLocation } from "wouter";
import { getScreenByPath } from "@/config/screens";
import { useScanner } from "@/hooks/useScanner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopNavBar() {
  const [location] = useLocation();
  const currentScreen = getScreenByPath(location);
  const { openScanner } = useScanner();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log("Searching for:", searchQuery);
  };

  const getBreadcrumb = () => {
    if (location === "/" || location === "/dashboard") {
      return "Home / Dashboard";
    }
    
    const pathParts = location.split("/").filter(Boolean);
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
    if (location === "/" || location === "/dashboard") {
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
          onClick={() => {
            // This would typically toggle the mobile sidebar
            console.log("Toggle mobile menu");
          }}
        >
          <i className="fas fa-bars"></i>
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
          <i className="fas fa-search absolute left-3 top-3 text-secondary-400"></i>
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
          <i className="fas fa-search"></i>
        </Button>

        {/* Scan Button */}
        {currentScreen?.scan.enabled && (
          <Button
            onClick={() => openScanner(currentScreen.scan.context || "general")}
            className="flex items-center px-2 lg:px-4 py-2 bg-primary-500 text-white hover:bg-primary-600"
          >
            <i className="fas fa-qrcode lg:mr-2"></i>
            <span className="hidden lg:inline">Scan</span>
          </Button>
        )}

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
          <i className="fas fa-bell"></i>
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-error-500 text-white text-xs rounded-full flex items-center justify-center">
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
            <i className="fas fa-chevron-down text-xs hidden lg:inline"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}

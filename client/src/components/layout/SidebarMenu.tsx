import { Link, useLocation } from "wouter";
import { getMenuGroups, type ScreenConfig } from "@/config/screens";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";
import { 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Home,
  ShoppingCart,
  MapPin,
  Truck,
  Package2,
  Warehouse,
  BarChart3,
  Settings,
  Users,
  FileText,
  Box,
  Route,
  Search,
  QrCode,
  Monitor,
  Building,
  UserCheck,
  Layers,
  Zap,
  CheckSquare,
  Target
} from "lucide-react";

// Icon mapping function to convert FontAwesome class names to Lucide components
const getIconComponent = (iconClass: string) => {
  const iconMap: Record<string, any> = {
    'fas fa-home': Home,
    'fas fa-shopping-cart': ShoppingCart,
    'fas fa-map-marker-alt': MapPin,
    'fas fa-truck': Truck,
    'fas fa-warehouse': Warehouse,
    'fas fa-chart-bar': BarChart3,
    'fas fa-cog': Settings,
    'fas fa-users': Users,
    'fas fa-file-alt': FileText,
    'fas fa-box': Box,
    'fas fa-route': Route,
    'fas fa-search': Search,
    'fas fa-qrcode': QrCode,
    'fas fa-desktop': Monitor,
    'fas fa-building': Building,
    'fas fa-user-check': UserCheck,
    'fas fa-layer-group': Layers,
    'fas fa-bolt': Zap,
    'fas fa-check-square': CheckSquare,
    'fas fa-bullseye': Target,
    'fas fa-package': Package2,
    'fas fa-search-location': Search,
  };

  const IconComponent = iconMap[iconClass] || Box;
  return <IconComponent className="h-4 w-4" />;
};

export default function SidebarMenu() {
  const [location] = useLocation();
  const menuGroups = getMenuGroups();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { isCollapsed, isMobile, toggleSidebar, setIsCollapsed, setIsMobile } = useSidebar();

  // Debug log
  console.log('Sidebar state:', { isCollapsed, isMobile });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      // Auto-collapse on smaller screens but keep visible as icons
      if (width < 768) {
        setIsCollapsed(true);
      } else if (width >= 1024) {
        // Don't auto-expand on desktop - let user control it
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed, setIsMobile]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleCollapse = () => {
    toggleSidebar();
  };

  const isActiveScreen = (screen: ScreenConfig): boolean => {
    if (screen.path === location) return true;
    if (screen.children) {
      return screen.children.some(child => child.path === location);
    }
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="sidebar-mobile-overlay lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white shadow-lg flex flex-col transition-all duration-300 z-50 border-r border-gray-200",
        isMobile ? "fixed" : "relative",
        "h-full flex-shrink-0",
        isCollapsed ? "sidebar-collapsed" : "sidebar-expanded",
        // On mobile, hide completely when collapsed, on desktop always show as icons
        isMobile && isCollapsed ? "sidebar-mobile-hidden" : "translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-secondary-700 whitespace-nowrap overflow-hidden">
                Saylogix
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="p-1 h-8 w-8 flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {Object.entries(menuGroups).map(([groupName, screens]) => (
            <div key={groupName} className="mb-4">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2 px-2">
                  {groupName}
                </h3>
              )}
              <div className="space-y-1">
                {screens.map((screen) => (
                  <div key={screen.path}>
                    {screen.children ? (
                      <div 
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative cursor-pointer",
                          isActiveScreen(screen)
                            ? "text-primary-600 bg-primary-50"
                            : "text-secondary-600 hover:bg-gray-100"
                        )}
                        title={isCollapsed ? screen.label : undefined}
                        onClick={() => toggleGroup(screen.path)}
                      >
                        <div className={cn("w-5 h-5 flex-shrink-0 text-current", isCollapsed ? "mx-auto" : "mr-3")}>
                          {getIconComponent(screen.icon)}
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{screen.label}</span>
                            <ChevronRight 
                              className={cn(
                                "w-3 h-3 ml-auto transition-transform flex-shrink-0 text-current",
                                expandedGroups[screen.path] ? "rotate-90" : ""
                              )}
                            />
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {screen.label}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link to={screen.path}>
                        <div 
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative cursor-pointer",
                            isActiveScreen(screen)
                              ? "text-primary-600 bg-primary-50"
                              : "text-secondary-600 hover:bg-gray-100"
                          )}
                          title={isCollapsed ? screen.label : undefined}
                        >
                          <div className={cn("w-5 h-5 flex-shrink-0 text-current", isCollapsed ? "mx-auto" : "mr-3")}>
                            {getIconComponent(screen.icon)}
                          </div>
                          {!isCollapsed && (
                            <span className="truncate">{screen.label}</span>
                          )}
                          
                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                              {screen.label}
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                    
                    {/* Child Routes */}
                    {!isCollapsed && screen.children && expandedGroups[screen.path] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {screen.children.map((child) => (
                          <Link key={child.path} to={child.path}>
                            <div
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                                location.pathname === child.path
                                  ? "text-primary-600 bg-primary-50"
                                  : "text-secondary-500 hover:bg-gray-50"
                              )}
                            >
                              <div className="w-4 h-4 mr-3 flex-shrink-0 text-current">
                                {getIconComponent(child.icon)}
                              </div>
                              <span className="truncate">{child.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        {/* User Profile Section */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-700 truncate">System Admin</p>
                <p className="text-xs text-secondary-500 truncate">Warehouse Manager</p>
              </div>
              <button className="text-secondary-500 hover:text-secondary-700">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
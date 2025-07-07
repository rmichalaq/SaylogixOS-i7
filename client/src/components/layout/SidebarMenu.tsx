import { Link, useLocation } from "wouter";
import { getMenuGroups, type ScreenConfig } from "@/config/screens";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SidebarMenu() {
  const [location] = useLocation();
  const menuGroups = getMenuGroups();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white shadow-lg flex flex-col transition-all duration-300 z-50",
        "fixed lg:relative h-full",
        isCollapsed ? "w-16" : "w-64",
        isMobile && isCollapsed ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-cube text-white text-sm"></i>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-secondary-700 whitespace-nowrap overflow-hidden">
                SaylogixOS
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="ml-auto p-1 h-8 w-8"
          >
            <i className={cn(
              "fas transition-transform",
              isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            )}></i>
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
                    <Link href={screen.path}>
                      <a
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group relative",
                          isActiveScreen(screen)
                            ? "text-primary-600 bg-primary-50"
                            : "text-secondary-600 hover:bg-gray-100"
                        )}
                        title={isCollapsed ? screen.label : undefined}
                      >
                        <i className={cn(screen.icon, "w-5 h-5 flex-shrink-0", isCollapsed ? "mx-auto" : "mr-3")}></i>
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{screen.label}</span>
                            {screen.children && (
                              <i 
                                className={cn(
                                  "fas fa-chevron-right w-3 h-3 ml-auto transition-transform flex-shrink-0",
                                  expandedGroups[screen.path] ? "rotate-90" : ""
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleGroup(screen.path);
                                }}
                              ></i>
                            )}
                          </>
                        )}
                        
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {screen.label}
                          </div>
                        )}
                      </a>
                    </Link>
                    
                    {/* Child Routes */}
                    {!isCollapsed && screen.children && expandedGroups[screen.path] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {screen.children.map((child) => (
                          <Link key={child.path} href={child.path}>
                            <a
                              className={cn(
                                "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                                location === child.path
                                  ? "text-primary-600 bg-primary-50"
                                  : "text-secondary-500 hover:bg-gray-50"
                              )}
                            >
                              <i className={cn(child.icon, "w-4 h-4 mr-3 flex-shrink-0")}></i>
                              <span className="truncate">{child.label}</span>
                            </a>
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

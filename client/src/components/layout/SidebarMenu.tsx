import { Link, useLocation } from "wouter";
import { getMenuGroups, type ScreenConfig } from "@/config/screens";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SidebarMenu() {
  const [location] = useLocation();
  const menuGroups = getMenuGroups();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const isActiveScreen = (screen: ScreenConfig): boolean => {
    if (screen.path === location) return true;
    if (screen.children) {
      return screen.children.some(child => child.path === location);
    }
    return false;
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-cube text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-secondary-700">SaylogixOS</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {Object.entries(menuGroups).map(([groupName, screens]) => (
          <div key={groupName} className="px-4 mb-4">
            <h3 className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
              {groupName}
            </h3>
            <div className="space-y-1">
              {screens.map((screen) => (
                <div key={screen.path}>
                  <Link href={screen.path}>
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActiveScreen(screen)
                          ? "text-primary-600 bg-primary-50"
                          : "text-secondary-600 hover:bg-gray-100"
                      )}
                    >
                      <i className={cn(screen.icon, "w-5 h-5 mr-3")}></i>
                      {screen.label}
                      {screen.children && (
                        <i 
                          className={cn(
                            "fas fa-chevron-right w-3 h-3 ml-auto transition-transform",
                            expandedGroups[screen.path] ? "rotate-90" : ""
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleGroup(screen.path);
                          }}
                        ></i>
                      )}
                    </a>
                  </Link>
                  
                  {/* Child Routes */}
                  {screen.children && expandedGroups[screen.path] && (
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
                            <i className={cn(child.icon, "w-4 h-4 mr-3")}></i>
                            {child.label}
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
    </aside>
  );
}

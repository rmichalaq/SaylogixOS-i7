import { useSidebar } from "@/context/SidebarContext";

export default function TestDashboard() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard Working!</h1>
      <p>This is a simple test to see if routing works.</p>
      <div className="mt-4">
        <p>Sidebar collapsed: {isCollapsed ? 'Yes' : 'No'}</p>
        <button 
          onClick={toggleSidebar}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle Sidebar
        </button>
      </div>
    </div>
  );
}
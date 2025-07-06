import { KpiCards } from "./KpiCards";
import { LiveActivity } from "./LiveActivity";
import { QuickActions } from "./QuickActions";
import { RecentOrders } from "./RecentOrders";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <KpiCards />

      {/* Live Activity and Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivity />
        
        {/* Performance Chart Placeholder */}
        <div className="saylogix-card p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Order Processing Performance
            </h3>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-400 rounded"></div>
              </div>
              <p className="text-gray-500">Chart visualization</p>
              <p className="text-sm text-gray-400">Shows order processing trends over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}

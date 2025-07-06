import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, Calendar, TrendingUp, Package, Truck, Users, AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("7days");
  const [reportType, setReportType] = useState("overview");

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 300000
  });

  const { data: verificationStats } = useQuery({
    queryKey: ["/api/stats/verification"],
    refetchInterval: 300000
  });

  const { data: webhookStats } = useQuery({
    queryKey: ["/api/stats/webhooks"],
    refetchInterval: 300000
  });

  // Calculate performance metrics
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter((o: any) => o.status === 'delivered').length || 0;
  const fulfillmentRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  
  // Calculate average processing time (mock calculation)
  const avgProcessingTime = "2.4 hours";
  const onTimeDeliveryRate = 96.2;

  const reportCards = [
    {
      title: "Order Volume",
      value: totalOrders.toString(),
      trend: "+12.5%",
      trendUp: true,
      icon: Package,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Fulfillment Rate",
      value: `${fulfillmentRate.toFixed(1)}%`,
      trend: "+2.1%",
      trendUp: true,
      icon: TrendingUp,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Avg Processing Time",
      value: avgProcessingTime,
      trend: "-15 min",
      trendUp: true,
      icon: Clock,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "On-Time Delivery",
      value: `${onTimeDeliveryRate}%`,
      trend: "+1.3%",
      trendUp: true,
      icon: Truck,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Operational insights and performance metrics</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Report Type:</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="fulfillment">Fulfillment Performance</SelectItem>
                <SelectItem value="warehouse">Warehouse Operations</SelectItem>
                <SelectItem value="delivery">Delivery Performance</SelectItem>
                <SelectItem value="exceptions">Exception Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    <p className={`text-sm flex items-center ${
                      card.trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-3 h-3 mr-1 ${!card.trendUp ? 'rotate-180' : ''}`} />
                      {card.trend} vs last period
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Order Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Order flow chart visualization</p>
                <p className="text-sm text-gray-400">Shows order processing stages over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Performance trends chart</p>
                <p className="text-sm text-gray-400">Shows KPI trends and performance metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Address Verification Report */}
        <Card>
          <CardHeader>
            <CardTitle>Address Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Verifications</span>
                <span className="font-medium">{verificationStats?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">
                  {verificationStats?.successRate?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">WhatsApp Required</span>
                <span className="font-medium">{verificationStats?.whatsappSent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${verificationStats?.successRate || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Webhooks</span>
                <span className="font-medium">{webhookStats?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Successful</span>
                <span className="font-medium text-green-600">{webhookStats?.success || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed</span>
                <span className="font-medium text-red-600">{webhookStats?.failed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retrying</span>
                <span className="font-medium text-amber-600">{webhookStats?.retrying || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="font-medium text-green-600">245ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Connections</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="font-medium text-green-600">0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {dashboardStats?.activeOrders || 0}
              </div>
              <p className="text-sm text-gray-600">Orders in Process</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {dashboardStats?.deliveredToday || 0}
              </div>
              <p className="text-sm text-gray-600">Delivered Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 mb-2">
                {dashboardStats?.inPicking || 0}
              </div>
              <p className="text-sm text-gray-600">Currently Picking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

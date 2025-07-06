import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hand, Search, Package, Clock, CheckCircle, AlertTriangle, MapPin } from "lucide-react";

export default function PickingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pickTasks, isLoading } = useQuery({
    queryKey: ["/api/pick-tasks"],
    refetchInterval: 10000
  });

  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'exception': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = pickTasks?.filter((task: any) =>
    task.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.binLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.toteId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pendingTasks = pickTasks?.filter((task: any) => task.status === 'pending').length || 0;
  const inProgressTasks = pickTasks?.filter((task: any) => task.status === 'in_progress').length || 0;
  const completedTasks = pickTasks?.filter((task: any) => task.status === 'completed').length || 0;
  const exceptionTasks = pickTasks?.filter((task: any) => task.status === 'exception').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Picking Management</h1>
          <p className="text-gray-600">Manage warehouse picking tasks and optimize pick paths</p>
        </div>
        <Button className="saylogix-primary">
          <Hand className="h-4 w-4 mr-2" />
          Start Picking
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-amber-600">{pendingTasks}</p>
                <p className="text-sm text-amber-600">Ready to pick</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
                <p className="text-sm text-blue-600">Being picked</p>
              </div>
              <Hand className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-green-600">Successfully picked</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exceptions</p>
                <p className="text-3xl font-bold text-red-600">{exceptionTasks}</p>
                <p className="text-sm text-red-600">Need attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by SKU, bin location, or tote ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pick Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Pick Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading pick tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Hand className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No pick tasks found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task: any) => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      {task.pickPath && (
                        <Badge variant="outline">
                          Path {task.pickPath}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {task.status === 'pending' && (
                        <Button size="sm" className="saylogix-primary">
                          Start Pick
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Product</p>
                      <p className="text-sm font-bold text-gray-900">{task.sku}</p>
                      <p className="text-sm text-gray-600">Qty: {task.quantity}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Bin Location</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                        {task.binLocation}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Tote</p>
                      <p className="text-sm text-gray-900">{task.toteId || 'Not assigned'}</p>
                      {task.assignedTo && (
                        <p className="text-sm text-gray-500">Picker: {task.assignedTo}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Progress</p>
                      <p className="text-sm text-gray-900">
                        {task.pickedQty || 0} / {task.quantity}
                      </p>
                      {task.exceptionReason && (
                        <p className="text-sm text-red-600">{task.exceptionReason}</p>
                      )}
                    </div>
                  </div>

                  {task.status === 'in_progress' && (
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${((task.pickedQty || 0) / task.quantity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(((task.pickedQty || 0) / task.quantity) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

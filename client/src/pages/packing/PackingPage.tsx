import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box, Search, Package, Scale, Printer, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function PackingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: packTasks, isLoading } = useQuery({
    queryKey: ["/api/pack-tasks"],
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

  const filteredTasks = packTasks?.filter((task: any) =>
    task.toteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pendingTasks = packTasks?.filter((task: any) => task.status === 'pending').length || 0;
  const inProgressTasks = packTasks?.filter((task: any) => task.status === 'in_progress').length || 0;
  const completedTasks = packTasks?.filter((task: any) => task.status === 'completed').length || 0;
  const exceptionTasks = packTasks?.filter((task: any) => task.status === 'exception').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        </div>
        <Button className="saylogix-primary">
          <Box className="h-4 w-4 mr-2" />
          Start Packing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Pack</p>
                <p className="text-3xl font-bold text-amber-600">{pendingTasks}</p>
                <p className="text-sm text-amber-600">Totes waiting</p>
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
                <p className="text-sm text-blue-600">Being packed</p>
              </div>
              <Box className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Packed Today</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
                <p className="text-sm text-green-600">Ready to ship</p>
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
              placeholder="Search by tote ID, tracking number, or packer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pack Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Packing Queue ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading pack tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No pack tasks found</p>
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
                      {task.labelGenerated && (
                        <Badge className="bg-green-100 text-green-800">
                          <Printer className="h-3 w-3 mr-1" />
                          Label Ready
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Items
                      </Button>
                      {task.status === 'pending' && (
                        <Button size="sm" className="saylogix-primary">
                          Start Packing
                        </Button>
                      )}
                      {task.labelGenerated && (
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4 mr-2" />
                          Print Label
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Tote ID</p>
                      <p className="text-sm font-bold text-gray-900">{task.toteId}</p>
                      {task.assignedTo && (
                        <p className="text-sm text-gray-500">Packer: {task.assignedTo}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Box Type</p>
                      <p className="text-sm text-gray-900">{task.boxType || 'Not selected'}</p>
                      {task.dimensions && (
                        <p className="text-sm text-gray-500">
                          {task.dimensions.length}×{task.dimensions.width}×{task.dimensions.height} cm
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Weight</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Scale className="h-3 w-3 mr-1 text-blue-600" />
                        {task.weight ? `${task.weight} kg` : 'Not weighed'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Tracking</p>
                      <p className="text-sm text-gray-900">
                        {task.trackingNumber || 'Not generated'}
                      </p>
                      {task.packedAt && (
                        <p className="text-sm text-gray-500">
                          Packed: {new Date(task.packedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.exceptionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-800 font-medium">Exception:</p>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{task.exceptionReason}</p>
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <p className="text-sm text-green-800 font-medium">
                            Package ready for dispatch
                          </p>
                        </div>
                        <div className="text-sm text-green-700">
                          Weight: {task.weight} kg | Tracking: {task.trackingNumber}
                        </div>
                      </div>
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

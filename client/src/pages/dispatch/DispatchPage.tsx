import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, Package, FileText, CheckCircle, AlertTriangle, Clock, Users } from "lucide-react";

export default function DispatchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: manifests, isLoading } = useQuery({
    queryKey: ["/api/manifests"],
    refetchInterval: 30000
  });

  const getManifestStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'handed_over': return 'bg-green-100 text-green-800';
      case 'exception': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredManifests = manifests?.filter((manifest: any) =>
    manifest.manifestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.courierName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pendingManifests = manifests?.filter((m: any) => m.status === 'pending').length || 0;
  const readyManifests = manifests?.filter((m: any) => m.status === 'ready').length || 0;
  const handedOverToday = manifests?.filter((m: any) => 
    m.status === 'handed_over' && 
    new Date(m.handedOverAt).toDateString() === new Date().toDateString()
  ).length || 0;
  const totalPackages = manifests?.reduce((sum: number, m: any) => sum + (m.totalPackages || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Manifest
          </Button>
          <Button className="saylogix-primary">
            <Truck className="h-4 w-4 mr-2" />
            Schedule Pickup
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Manifests</p>
                <p className="text-3xl font-bold text-amber-600">{pendingManifests}</p>
                <p className="text-sm text-amber-600">Awaiting pickup</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Pickup</p>
                <p className="text-3xl font-bold text-blue-600">{readyManifests}</p>
                <p className="text-sm text-blue-600">Staged packages</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dispatched Today</p>
                <p className="text-3xl font-bold text-green-600">{handedOverToday}</p>
                <p className="text-sm text-green-600">Manifests completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-3xl font-bold text-purple-600">{totalPackages}</p>
                <p className="text-sm text-purple-600">In all manifests</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
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
              placeholder="Search by manifest number or courier name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Manifests */}
      <Card>
        <CardHeader>
          <CardTitle>Dispatch Manifests ({filteredManifests.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading manifests...</p>
            </div>
          ) : filteredManifests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No manifests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredManifests.map((manifest: any) => (
                <div key={manifest.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={getManifestStatusColor(manifest.status)}>
                        {manifest.status}
                      </Badge>
                      <h3 className="text-lg font-medium text-gray-900">
                        {manifest.manifestNumber}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Manifest
                      </Button>
                      {manifest.status === 'ready' && (
                        <Button size="sm" className="saylogix-primary">
                          <Users className="h-4 w-4 mr-2" />
                          Handover
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Courier</p>
                      <p className="text-sm font-bold text-gray-900">{manifest.courierName}</p>
                      <p className="text-sm text-gray-600">
                        {manifest.totalPackages} packages
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Generated</p>
                      <p className="text-sm text-gray-900">
                        {new Date(manifest.generatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(manifest.generatedAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Handed Over</p>
                      <p className="text-sm text-gray-900">
                        {manifest.handedOverAt 
                          ? new Date(manifest.handedOverAt).toLocaleDateString()
                          : 'Pending'
                        }
                      </p>
                      {manifest.handedOverTo && (
                        <p className="text-sm text-gray-500">To: {manifest.handedOverTo}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                      {manifest.status === 'handed_over' && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                      {manifest.status === 'ready' && (
                        <div className="flex items-center text-blue-600">
                          <Package className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Ready for pickup</span>
                        </div>
                      )}
                      {manifest.status === 'pending' && (
                        <div className="flex items-center text-amber-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Being prepared</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {manifest.status === 'ready' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-blue-600 mr-2" />
                          <p className="text-sm text-blue-800 font-medium">
                            Manifest ready for courier pickup
                          </p>
                        </div>
                        <div className="text-sm text-blue-700">
                          {manifest.totalPackages} packages staged
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

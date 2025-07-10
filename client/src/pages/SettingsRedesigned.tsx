import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Settings, 
  Building, 
  Users, 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin,
  Package,
  Truck,
  Shield,
  FileText,
  DollarSign,
  User,
  Link,
  ChevronDown,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Loader
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWarehouseZoneSchema, insertStaffRoleSchema, insertToteCartTypeSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Main Settings Component
export default function SettingsRedesigned() {
  const [activeMainTab, setActiveMainTab] = useState("warehouse");
  const [activeSubTab, setActiveSubTab] = useState("warehouses");

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={(value) => {
        setActiveMainTab(value);
        // Reset sub-tab when switching main tabs
        if (value === "warehouse") setActiveSubTab("warehouses");
        else if (value === "users") setActiveSubTab("roles");
        else if (value === "clients") setActiveSubTab("details");
      }}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Warehouse
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        {/* Warehouse Tab */}
        <TabsContent value="warehouse">
          <WarehouseSettings activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersSettings activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <ClientsSettings activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Warehouse Settings Component
function WarehouseSettings({ activeSubTab, setActiveSubTab }: { activeSubTab: string; setActiveSubTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="warehouses">Warehouses / Hubs</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="packaging">Packaging Material</TabsTrigger>
          <TabsTrigger value="docks">Dock Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses">
          <WarehousesList />
        </TabsContent>

        <TabsContent value="zones">
          <ZonesList />
        </TabsContent>

        <TabsContent value="locations">
          <LocationsList />
        </TabsContent>

        <TabsContent value="packaging">
          <PackagingMaterialList />
        </TabsContent>

        <TabsContent value="docks">
          <DockSettingsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Users Settings Component
function UsersSettings({ activeSubTab, setActiveSubTab }: { activeSubTab: string; setActiveSubTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">User Roles</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <UserRolesList />
        </TabsContent>

        <TabsContent value="users">
          <UsersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Clients Settings Component
function ClientsSettings({ activeSubTab, setActiveSubTab }: { activeSubTab: string; setActiveSubTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="details">Client Details</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="slas">SLAs</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="integrations">Connected Integrations</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ClientDetailsList />
        </TabsContent>

        <TabsContent value="contract">
          <ContractList />
        </TabsContent>

        <TabsContent value="slas">
          <SLAsList />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingList />
        </TabsContent>

        <TabsContent value="suppliers">
          <SuppliersList />
        </TabsContent>

        <TabsContent value="integrations">
          <ConnectedIntegrationsList />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingRulesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Warehouses List Component
function WarehousesList() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Warehouses / Hubs</CardTitle>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Jeddah Fulfillment Center</h3>
                <p className="text-sm text-gray-600">King Fahd Industrial Port, Jeddah 23421</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              <Switch defaultChecked />
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                View Map
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Riyadh Distribution Hub</h3>
                <p className="text-sm text-gray-600">Industrial City, Riyadh 11564</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              <Switch defaultChecked />
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                View Map
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Zones List Component  
function ZonesList() {
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["/api/warehouse-zones"],
  });

  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Warehouse Zones</CardTitle>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Zone
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {zones.map((zone: any) => (
            <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{zone.name}</h3>
                <p className="text-sm text-gray-600">{zone.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={zone.isActive ? "outline" : "secondary"} 
                       className={zone.isActive ? "bg-green-50 text-green-700" : ""}>
                  {zone.isActive ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={zone.isActive} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Locations List Component
function LocationsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Storage Locations</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Location
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["A-01", "A-02", "A-03", "B-01", "B-02", "B-03"].map((location) => (
              <div key={location} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{location}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Zone A, Aisle 1</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Packaging Material List Component
function PackagingMaterialList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Packaging Materials</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Polybag", description: "Small plastic protective bags", active: true },
            { name: "Cardboard Box", description: "Standard shipping boxes", active: true },
            { name: "Ice Pack", description: "Temperature-sensitive items", active: true },
            { name: "Bubble Wrap", description: "Fragile item protection", active: false }
          ].map((material, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Package className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{material.name}</h3>
                  <p className="text-sm text-gray-600">{material.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={material.active ? "outline" : "secondary"} 
                       className={material.active ? "bg-green-50 text-green-700" : ""}>
                  {material.active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={material.active} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Dock Settings List Component
function DockSettingsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Loading Dock Configuration</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Dock
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Dock A1", vehicles: ["Truck", "Van"], equipment: "Barcode Scanner", active: true },
            { name: "Dock A2", vehicles: ["Truck"], equipment: "RFID Reader", active: true },
            { name: "Dock B1", vehicles: ["Van", "Motorcycle"], equipment: "Mobile Scanner", active: false }
          ].map((dock, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{dock.name}</h3>
                  <p className="text-sm text-gray-600">
                    Vehicles: {dock.vehicles.join(", ")} • Equipment: {dock.equipment}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={dock.active ? "outline" : "secondary"} 
                       className={dock.active ? "bg-green-50 text-green-700" : ""}>
                  {dock.active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={dock.active} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// User Roles List Component
function UserRolesList() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["/api/staff-roles"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Roles & Permissions</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Warehouse Manager", description: "Full access to warehouse operations", permissions: 15 },
            { name: "Picker", description: "Access to picking tasks only", permissions: 3 },
            { name: "Packer", description: "Access to packing tasks only", permissions: 3 },
            { name: "Admin", description: "System administrator access", permissions: 25 }
          ].map((role, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{role.name}</h3>
                  <p className="text-sm text-gray-600">{role.description}</p>
                  <p className="text-xs text-gray-500">{role.permissions} permissions assigned</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">Edit Permissions</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Permissions
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Users List Component
function UsersList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System Users</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Ahmed Al-Rashid", email: "ahmed@saylogix.com", role: "Warehouse Manager", warehouse: "Jeddah FC", active: true },
            { name: "Fatima Hassan", email: "fatima@saylogix.com", role: "Picker", warehouse: "Riyadh Hub", active: true },
            { name: "Mohammed Said", email: "mohammed@saylogix.com", role: "Admin", warehouse: "All", active: true },
            { name: "Sarah Abdullah", email: "sarah@saylogix.com", role: "Packer", warehouse: "Jeddah FC", active: false }
          ].map((user, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <User className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.role} • {user.warehouse}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={user.active ? "outline" : "secondary"} 
                       className={user.active ? "bg-green-50 text-green-700" : ""}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={user.active} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Client Details List Component
function ClientDetailsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Companies</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "TechCorp Solutions", contact: "John Smith", type: "3PL Fulfillment", logo: "TC" },
            { name: "Fashion Forward", contact: "Sarah Johnson", type: "E-commerce", logo: "FF" },
            { name: "Electronics Plus", contact: "Ahmed Hassan", type: "Marketplace", logo: "EP" }
          ].map((client, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{client.logo}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-gray-600">Primary Contact: {client.contact}</p>
                  <p className="text-xs text-gray-500">Type: {client.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Contract List Component
function ContractList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Contracts</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { client: "TechCorp Solutions", start: "2024-01-01", end: "2025-12-31", status: "Active", renewal: true },
            { client: "Fashion Forward", start: "2024-06-01", end: "2025-05-31", status: "Active", renewal: false },
            { client: "Electronics Plus", start: "2023-09-01", end: "2024-08-31", status: "Expired", renewal: true }
          ].map((contract, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <FileText className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{contract.client}</h3>
                  <p className="text-sm text-gray-600">{contract.start} to {contract.end}</p>
                  <p className="text-xs text-gray-500">
                    Auto-renewal: {contract.renewal ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={contract.status === "Active" ? "outline" : "secondary"} 
                       className={contract.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}>
                  {contract.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Contract
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// SLAs List Component
function SLAsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Service Level Agreements</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add SLA
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { type: "Order Processing", timeLimit: "2 hours", orders: "All orders", alerts: true },
            { type: "Picking Completion", timeLimit: "4 hours", orders: "Standard orders", alerts: true },
            { type: "Packing Completion", timeLimit: "1 hour", orders: "Express orders", alerts: false },
            { type: "Dispatch Cutoff", timeLimit: "6 PM", orders: "Same-day delivery", alerts: true }
          ].map((sla, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Clock className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{sla.type}</h3>
                  <p className="text-sm text-gray-600">Time Limit: {sla.timeLimit}</p>
                  <p className="text-xs text-gray-500">Applies to: {sla.orders}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={sla.alerts ? "outline" : "secondary"} 
                       className={sla.alerts ? "bg-green-50 text-green-700" : ""}>
                  {sla.alerts ? "Alerts On" : "Alerts Off"}
                </Badge>
                <Switch checked={sla.alerts} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit SLA
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Performance
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Pricing List Component
function PricingList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pricing & Rate Cards</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Rate Card
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Standard Fulfillment", type: "Per Order", rate: "SAR 15.00", active: true },
            { name: "Express Processing", type: "Per Order", rate: "SAR 25.00", active: true },
            { name: "Storage Fee", type: "Per SKU/Month", rate: "SAR 2.50", active: true },
            { name: "Returns Processing", type: "Per Return", rate: "SAR 8.00", active: false }
          ].map((pricing, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <DollarSign className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold">{pricing.name}</h3>
                  <p className="text-sm text-gray-600">Billing: {pricing.type}</p>
                  <p className="text-lg font-bold text-green-600">{pricing.rate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={pricing.active ? "outline" : "secondary"} 
                       className={pricing.active ? "bg-green-50 text-green-700" : ""}>
                  {pricing.active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={pricing.active} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Rate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Suppliers List Component
function SuppliersList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Supplier Network</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Global Tech Supplies", contact: "Ahmed Al-Mansouri", client: "TechCorp Solutions", items: 150 },
            { name: "Fashion Wholesale", contact: "Sarah Al-Zahra", client: "Fashion Forward", items: 89 },
            { name: "Electronics Direct", contact: "Mohammed Khalil", client: "Electronics Plus", items: 220 }
          ].map((supplier, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Building className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{supplier.name}</h3>
                  <p className="text-sm text-gray-600">Contact: {supplier.contact}</p>
                  <p className="text-xs text-gray-500">
                    Linked to: {supplier.client} • {supplier.items} approved items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Supplier
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Items
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Connected Integrations List Component
function ConnectedIntegrationsList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Integrations</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Connect Integration
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Shopify Store", client: "Fashion Forward", type: "E-commerce", status: "Connected", sync: "Real-time" },
            { name: "WooCommerce", client: "Electronics Plus", type: "E-commerce", status: "Connected", sync: "Hourly" },
            { name: "Magento", client: "TechCorp Solutions", type: "E-commerce", status: "Error", sync: "Failed" }
          ].map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Link className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{integration.name}</h3>
                  <p className="text-sm text-gray-600">Client: {integration.client}</p>
                  <p className="text-xs text-gray-500">Type: {integration.type} • Sync: {integration.sync}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={integration.status === "Connected" ? "outline" : "destructive"} 
                       className={integration.status === "Connected" ? "bg-green-50 text-green-700" : ""}>
                  {integration.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Logs
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Shipping Rules List Component
function ShippingRulesList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shipping Rules & Preferences</CardTitle>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { region: "Riyadh", preferred: "Aramex", weight: "< 5kg", fallback: "SMSA" },
            { region: "Jeddah", preferred: "SMSA", weight: "< 10kg", fallback: "Naqel" },
            { region: "Eastern Province", preferred: "Naqel", weight: "Any", fallback: "Aramex" },
            { region: "Remote Areas", preferred: "Saudi Post", weight: "< 2kg", fallback: "None" }
          ].map((rule, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{rule.region}</h3>
                  <p className="text-sm text-gray-600">Preferred: {rule.preferred}</p>
                  <p className="text-xs text-gray-500">
                    Weight: {rule.weight} • Fallback: {rule.fallback}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Rule
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Performance
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
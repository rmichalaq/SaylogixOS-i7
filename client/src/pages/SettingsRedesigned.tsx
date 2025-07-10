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

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
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
          <WarehouseSettings />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersSettings />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <ClientsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Warehouse Settings Component - No sub-tabs, direct warehouse list
function WarehouseSettings() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleWarehouseClick = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setDrawerOpen(true);
  };

  return (
    <>
      <WarehousesList onWarehouseClick={handleWarehouseClick} />
      
      {/* Warehouse Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedWarehouse?.name || "Warehouse Details"}</SheetTitle>
            <SheetDescription>{selectedWarehouse?.address}</SheetDescription>
          </SheetHeader>
          
          {selectedWarehouse && (
            <div className="mt-6 space-y-6">
              {/* Drawer Tabs for warehouse sections */}
              <Tabs defaultValue="zones">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="zones">Zones</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="packaging">Packaging</TabsTrigger>
                  <TabsTrigger value="docks">Docks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="zones" className="mt-4">
                  <ZonesDrawerContent warehouseId={selectedWarehouse.id} />
                </TabsContent>
                
                <TabsContent value="locations" className="mt-4">
                  <LocationsDrawerContent warehouseId={selectedWarehouse.id} />
                </TabsContent>
                
                <TabsContent value="packaging" className="mt-4">
                  <PackagingDrawerContent warehouseId={selectedWarehouse.id} />
                </TabsContent>
                
                <TabsContent value="docks" className="mt-4">
                  <DocksDrawerContent warehouseId={selectedWarehouse.id} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Users Settings Component - With sub-tabs for Roles and Users
function UsersSettings() {
  const [activeSubTab, setActiveSubTab] = useState("roles");

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

// Clients Settings Component - No sub-tabs, direct client list
function ClientsSettings() {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClientClick = (client: any) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };

  return (
    <>
      <ClientDetailsList onClientClick={handleClientClick} />
      
      {/* Client Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedClient?.name || "Client Details"}</SheetTitle>
            <SheetDescription>{selectedClient?.type}</SheetDescription>
          </SheetHeader>
          
          {selectedClient && (
            <div className="mt-6 space-y-6">
              {/* Drawer Tabs for client sections */}
              <Tabs defaultValue="contract">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="contract">Contract</TabsTrigger>
                  <TabsTrigger value="sla">SLA</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contract" className="mt-4">
                  <ContractDrawerContent clientId={selectedClient.id} />
                </TabsContent>
                
                <TabsContent value="sla" className="mt-4">
                  <SLADrawerContent clientId={selectedClient.id} />
                </TabsContent>
                
                <TabsContent value="pricing" className="mt-4">
                  <PricingDrawerContent clientId={selectedClient.id} />
                </TabsContent>
                
                <TabsContent value="suppliers" className="mt-4">
                  <SuppliersDrawerContent clientId={selectedClient.id} />
                </TabsContent>
                
                <TabsContent value="integrations" className="mt-4">
                  <IntegrationsDrawerContent clientId={selectedClient.id} />
                </TabsContent>
                
                <TabsContent value="shipping" className="mt-4">
                  <ShippingDrawerContent clientId={selectedClient.id} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Warehouses List Component
function WarehousesList({ onWarehouseClick }: { onWarehouseClick: (warehouse: any) => void }) {
  const [createOpen, setCreateOpen] = useState(false);

  // Mock warehouses data
  const warehouses = [
    {
      id: "MOCK_JeddahFC",
      name: "Jeddah Fulfillment Center",
      address: "King Fahd Industrial Port, Jeddah 23421",
      active: true,
      zones: 4,
      locations: 120,
      docks: 6
    },
    {
      id: "MOCK_RiyadhHub", 
      name: "Riyadh Distribution Hub",
      address: "Industrial City, Riyadh 11564",
      active: true,
      zones: 3,
      locations: 80,
      docks: 4
    },
    {
      id: "MOCK_DammamWH",
      name: "Dammam Warehouse",
      address: "2nd Industrial Area, Dammam 31422",
      active: false,
      zones: 2,
      locations: 40,
      docks: 2
    }
  ];

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
          {warehouses.map((warehouse) => (
            <div 
              key={warehouse.id} 
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onWarehouseClick(warehouse)}
            >
              <div className="flex items-center gap-4">
                <Building className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{warehouse.name}</h3>
                  <p className="text-sm text-gray-600">{warehouse.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {warehouse.zones} zones • {warehouse.locations} locations • {warehouse.docks} docks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={warehouse.active ? "outline" : "secondary"} 
                       className={warehouse.active ? "bg-green-50 text-green-700" : ""}>
                  {warehouse.active ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={warehouse.active} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          ))}
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
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRoleClick = (role: any) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  // Mock roles data
  const roles = [
    { 
      id: "MOCK_WM",
      name: "Warehouse Manager", 
      description: "Full access to warehouse operations", 
      permissions: 15,
      users: 3
    },
    { 
      id: "MOCK_Picker",
      name: "Picker", 
      description: "Access to picking tasks only", 
      permissions: 3,
      users: 12
    },
    { 
      id: "MOCK_Packer",
      name: "Packer", 
      description: "Access to packing tasks only", 
      permissions: 3,
      users: 8
    },
    { 
      id: "MOCK_Admin",
      name: "Admin", 
      description: "System administrator access", 
      permissions: 25,
      users: 2
    }
  ];

  return (
    <>
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
            {roles.map((role) => (
              <div 
                key={role.id} 
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRoleClick(role)}
              >
                <div className="flex items-center gap-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <p className="text-xs text-gray-500">{role.permissions} permissions • {role.users} users</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedRole?.name || "Role Permissions"}</SheetTitle>
            <SheetDescription>{selectedRole?.description}</SheetDescription>
          </SheetHeader>
          
          {selectedRole && <RolePermissionsDrawerContent role={selectedRole} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Users List Component
function UsersList() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  // Mock users data
  const users = [
    { 
      id: "MOCK_User1",
      name: "Ahmed Al-Rashid", 
      email: "ahmed@saylogix.com", 
      role: "Warehouse Manager", 
      warehouse: "Jeddah FC", 
      active: true,
      phone: "+966 50 123 4567",
      joinDate: "2023-01-15"
    },
    { 
      id: "MOCK_User2",
      name: "Fatima Hassan", 
      email: "fatima@saylogix.com", 
      role: "Picker", 
      warehouse: "Riyadh Hub", 
      active: true,
      phone: "+966 50 234 5678",
      joinDate: "2023-03-20"
    },
    { 
      id: "MOCK_User3",
      name: "Mohammed Said", 
      email: "mohammed@saylogix.com", 
      role: "Admin", 
      warehouse: "All", 
      active: true,
      phone: "+966 50 345 6789",
      joinDate: "2022-11-05"
    },
    { 
      id: "MOCK_User4",
      name: "Sarah Abdullah", 
      email: "sarah@saylogix.com", 
      role: "Packer", 
      warehouse: "Jeddah FC", 
      active: false,
      phone: "+966 50 456 7890",
      joinDate: "2023-06-10"
    }
  ];

  return (
    <>
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
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleUserClick(user)}
              >
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedUser?.name || "User Details"}</SheetTitle>
            <SheetDescription>{selectedUser?.email}</SheetDescription>
          </SheetHeader>
          
          {selectedUser && <UserDetailsDrawerContent user={selectedUser} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

// Client Details List Component
function ClientDetailsList({ onClientClick }: { onClientClick: (client: any) => void }) {
  const [createOpen, setCreateOpen] = useState(false);

  // Mock clients data
  const clients = [
    { 
      id: "MOCK_TechCorp",
      name: "TechCorp Solutions", 
      contact: "John Smith", 
      type: "3PL Fulfillment", 
      logo: "TC",
      active: true,
      contractEnd: "2025-12-31",
      slaCount: 4,
      integrations: 3
    },
    { 
      id: "MOCK_FashionFwd",
      name: "Fashion Forward", 
      contact: "Sarah Johnson", 
      type: "E-commerce", 
      logo: "FF",
      active: true,
      contractEnd: "2025-05-31",
      slaCount: 3,
      integrations: 2
    },
    { 
      id: "MOCK_ElecPlus",
      name: "Electronics Plus", 
      contact: "Ahmed Hassan", 
      type: "Marketplace", 
      logo: "EP",
      active: true,
      contractEnd: "2024-08-31",
      slaCount: 5,
      integrations: 4
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Companies</CardTitle>
        <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <div 
              key={client.id} 
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onClientClick(client)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{client.logo}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <p className="text-sm text-gray-600">Primary Contact: {client.contact}</p>
                  <p className="text-xs text-gray-500">
                    {client.type} • Contract ends {client.contractEnd} • {client.slaCount} SLAs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
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

// Drawer Content Components

// Warehouse Drawer Content Components
function ZonesDrawerContent({ warehouseId }: { warehouseId: string }) {
  const zones = [
    { name: "Zone A", description: "Floor level storage", active: true },
    { name: "Zone B", description: "Mezzanine level", active: true },
    { name: "Zone C", description: "Cold storage", active: true },
    { name: "Zone D", description: "Hazmat storage", active: false }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Warehouse Zones</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Zone</Button>
      </div>
      {zones.map((zone, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{zone.name}</p>
              <p className="text-sm text-gray-600">{zone.description}</p>
            </div>
            <Switch checked={zone.active} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationsDrawerContent({ warehouseId }: { warehouseId: string }) {
  const locations = [
    "A-01", "A-02", "A-03", "A-04",
    "B-01", "B-02", "B-03", "B-04",
    "C-01", "C-02", "C-03", "C-04"
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Storage Locations</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Location</Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {locations.map((loc) => (
          <div key={loc} className="p-2 border rounded text-center text-sm hover:bg-gray-50 cursor-pointer">
            {loc}
          </div>
        ))}
      </div>
    </div>
  );
}

function PackagingDrawerContent({ warehouseId }: { warehouseId: string }) {
  const materials = [
    { name: "Polybag", stock: 5000, unit: "pcs" },
    { name: "Cardboard Box S", stock: 1200, unit: "pcs" },
    { name: "Cardboard Box M", stock: 800, unit: "pcs" },
    { name: "Bubble Wrap", stock: 50, unit: "rolls" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Packaging Materials</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Material</Button>
      </div>
      {materials.map((material, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{material.name}</p>
              <p className="text-sm text-gray-600">Stock: {material.stock} {material.unit}</p>
            </div>
            <Button size="sm" variant="outline">Reorder</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocksDrawerContent({ warehouseId }: { warehouseId: string }) {
  const docks = [
    { name: "Dock A1", type: "Inbound", vehicles: ["Truck", "Van"] },
    { name: "Dock A2", type: "Inbound", vehicles: ["Truck"] },
    { name: "Dock B1", type: "Outbound", vehicles: ["Van", "Motorcycle"] },
    { name: "Dock B2", type: "Outbound", vehicles: ["Truck", "Van"] }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Loading Docks</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Dock</Button>
      </div>
      {docks.map((dock, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{dock.name}</p>
              <p className="text-sm text-gray-600">{dock.type} • {dock.vehicles.join(", ")}</p>
            </div>
            <Badge variant="outline">{dock.type}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// Client Drawer Content Components
function ContractDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">Current Contract</h3>
        <div className="space-y-2 text-sm">
          <p><span className="text-gray-600">Start Date:</span> January 1, 2024</p>
          <p><span className="text-gray-600">End Date:</span> December 31, 2025</p>
          <p><span className="text-gray-600">Contract Value:</span> SAR 1,200,000</p>
          <p><span className="text-gray-600">Auto-renewal:</span> <Switch defaultChecked className="inline-flex ml-2" /></p>
        </div>
        <Button className="mt-4" variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" /> View Document
        </Button>
      </div>
    </div>
  );
}

function SLADrawerContent({ clientId }: { clientId: string }) {
  const slas = [
    { type: "Order Processing", timeLimit: "2 hours", breach: false },
    { type: "Picking", timeLimit: "4 hours", breach: true },
    { type: "Packing", timeLimit: "1 hour", breach: false },
    { type: "Dispatch", timeLimit: "Same day by 6 PM", breach: false }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Service Level Agreements</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add SLA</Button>
      </div>
      {slas.map((sla, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{sla.type}</p>
              <p className="text-sm text-gray-600">Time Limit: {sla.timeLimit}</p>
            </div>
            <Badge variant={sla.breach ? "destructive" : "outline"} 
                   className={!sla.breach ? "bg-green-50 text-green-700" : ""}>
              {sla.breach ? "Breach Alert" : "On Track"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function PricingDrawerContent({ clientId }: { clientId: string }) {
  const pricing = [
    { service: "Standard Fulfillment", rate: "SAR 15.00", unit: "per order" },
    { service: "Express Processing", rate: "SAR 25.00", unit: "per order" },
    { service: "Storage", rate: "SAR 2.50", unit: "per SKU/month" },
    { service: "Returns", rate: "SAR 8.00", unit: "per return" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Pricing & Rate Card</h3>
        <Button size="sm" variant="outline">Export Rates</Button>
      </div>
      {pricing.map((price, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{price.service}</p>
              <p className="text-sm text-gray-600">{price.unit}</p>
            </div>
            <p className="font-semibold text-green-600">{price.rate}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SuppliersDrawerContent({ clientId }: { clientId: string }) {
  const suppliers = [
    { name: "Tech Supplier Co", contact: "John Doe", items: 45 },
    { name: "Fashion Wholesale", contact: "Jane Smith", items: 89 },
    { name: "Electronics Direct", contact: "Ahmed Ali", items: 120 }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Approved Suppliers</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button>
      </div>
      {suppliers.map((supplier, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <p className="font-medium">{supplier.name}</p>
          <p className="text-sm text-gray-600">Contact: {supplier.contact}</p>
          <p className="text-sm text-gray-600">{supplier.items} approved items</p>
        </div>
      ))}
    </div>
  );
}

function IntegrationsDrawerContent({ clientId }: { clientId: string }) {
  const integrations = [
    { name: "Shopify", status: "Connected", lastSync: "2 mins ago" },
    { name: "WhatsApp Business", status: "Connected", lastSync: "Active" },
    { name: "Aramex API", status: "Error", lastSync: "Failed" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Connected Integrations</h3>
        <Button size="sm"><Link className="h-4 w-4 mr-1" /> Connect</Button>
      </div>
      {integrations.map((integration, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{integration.name}</p>
              <p className="text-sm text-gray-600">Last sync: {integration.lastSync}</p>
            </div>
            <Badge variant={integration.status === "Connected" ? "outline" : "destructive"}
                   className={integration.status === "Connected" ? "bg-green-50 text-green-700" : ""}>
              {integration.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShippingDrawerContent({ clientId }: { clientId: string }) {
  const rules = [
    { region: "Riyadh", courier: "Aramex", weight: "< 5kg" },
    { region: "Jeddah", courier: "SMSA", weight: "< 10kg" },
    { region: "Eastern", courier: "Naqel", weight: "Any" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Shipping Rules</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>
      </div>
      {rules.map((rule, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <p className="font-medium">{rule.region}</p>
          <p className="text-sm text-gray-600">Courier: {rule.courier} • Weight: {rule.weight}</p>
        </div>
      ))}
    </div>
  );
}

// User Drawer Content Components
function RolePermissionsDrawerContent({ role }: { role: any }) {
  const permissions = [
    { module: "Orders", view: true, create: true, edit: true, delete: false },
    { module: "Inventory", view: true, create: false, edit: false, delete: false },
    { module: "Picking", view: true, create: true, edit: true, delete: false },
    { module: "Packing", view: true, create: true, edit: true, delete: false },
    { module: "Reports", view: true, create: false, edit: false, delete: false }
  ];

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-semibold">Role Permissions</h3>
      <div className="space-y-2">
        {permissions.map((perm, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <p className="font-medium mb-2">{perm.module}</p>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={perm.view} className="rounded" />
                View
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={perm.create} className="rounded" />
                Create
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={perm.edit} className="rounded" />
                Edit
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={perm.delete} className="rounded" />
                Delete
              </label>
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full">Save Permissions</Button>
    </div>
  );
}

function UserDetailsDrawerContent({ user }: { user: any }) {
  return (
    <div className="space-y-6 mt-6">
      <div className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input defaultValue={user.name} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" defaultValue={user.email} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input defaultValue={user.phone} />
        </div>
        <div>
          <Label>Role</Label>
          <Select defaultValue={user.role}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Warehouse Manager">Warehouse Manager</SelectItem>
              <SelectItem value="Picker">Picker</SelectItem>
              <SelectItem value="Packer">Packer</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Assigned Warehouse</Label>
          <Select defaultValue={user.warehouse}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Warehouses</SelectItem>
              <SelectItem value="Jeddah FC">Jeddah FC</SelectItem>
              <SelectItem value="Riyadh Hub">Riyadh Hub</SelectItem>
              <SelectItem value="Dammam WH">Dammam WH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>Account Status</Label>
          <Switch defaultChecked={user.active} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1">Save Changes</Button>
        <Button variant="outline" className="flex-1">Reset Password</Button>
      </div>
    </div>
  );
}
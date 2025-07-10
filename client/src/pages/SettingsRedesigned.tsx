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

  // No warehouses configured yet - show empty state
  const warehouses: any[] = [];

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
        {warehouses.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No warehouses configured</h3>
            <p className="text-gray-600 mb-4">Add your first warehouse to start managing operations</p>
          </div>
        ) : (
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
        )}
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
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No storage locations defined</h3>
          <p className="text-gray-600 mb-4">Configure warehouse zones and locations for inventory management</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
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
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No packaging materials configured</h3>
          <p className="text-gray-600 mb-4">Add packaging materials for order fulfillment operations</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
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
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No docks configured</h3>
          <p className="text-gray-600 mb-4">Configure loading docks for inbound and outbound operations</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Dock
          </Button>
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

  // No user roles configured yet - show empty state
  const roles: any[] = [];

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
          {roles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No user roles configured</h3>
              <p className="text-gray-600 mb-4">Create roles to manage user permissions and access levels</p>
            </div>
          ) : (
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
          )}
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

  // No users configured yet - show empty state
  const users: any[] = [];

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
          {users.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users added</h3>
              <p className="text-gray-600 mb-4">Add team members to manage system access and roles</p>
            </div>
          ) : (
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
          )}
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

  // No clients configured yet - show empty state
  const clients: any[] = [];

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
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients onboarded</h3>
            <p className="text-gray-600 mb-4">Add client companies to manage their fulfillment operations</p>
            <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        ) : (
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
        )}
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
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No contracts configured</h3>
          <p className="text-gray-600 mb-4">Add client contracts to manage service agreements</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Contract
          </Button>
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
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLAs configured</h3>
          <p className="text-gray-600 mb-4">Define service level agreements for performance monitoring</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add SLA
          </Button>
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
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pricing configured</h3>
          <p className="text-gray-600 mb-4">Set up rate cards and pricing structures for client billing</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rate Card
          </Button>
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
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No suppliers added</h3>
          <p className="text-gray-600 mb-4">Connect with suppliers to manage procurement and sourcing</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
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
        <div className="text-center py-12">
          <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No client integrations</h3>
          <p className="text-gray-600 mb-4">Connect client systems for automated data synchronization</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Connect Integration
          </Button>
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
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No shipping rules configured</h3>
          <p className="text-gray-600 mb-4">Set up shipping preferences and rules by region</p>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Drawer Content Components

// Warehouse Drawer Content Components
function ZonesDrawerContent({ warehouseId }: { warehouseId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Warehouse Zones</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Zone</Button>
      </div>
      <div className="text-center py-8">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No zones configured for this warehouse</p>
      </div>
    </div>
  );
}

function LocationsDrawerContent({ warehouseId }: { warehouseId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Storage Locations</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Location</Button>
      </div>
      <div className="text-center py-8">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No storage locations configured</p>
      </div>
    </div>
  );
}

function PackagingDrawerContent({ warehouseId }: { warehouseId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Packaging Materials</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Material</Button>
      </div>
      <div className="text-center py-8">
        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No packaging materials added</p>
      </div>
    </div>
  );
}

function DocksDrawerContent({ warehouseId }: { warehouseId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Loading Docks</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Dock</Button>
      </div>
      <div className="text-center py-8">
        <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No loading docks configured</p>
      </div>
    </div>
  );
}

// Client Drawer Content Components
function ContractDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No contract details available</p>
      </div>
    </div>
  );
}

function SLADrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Service Level Agreements</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add SLA</Button>
      </div>
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No SLAs configured</p>
      </div>
    </div>
  );
}

function PricingDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Pricing & Rate Card</h3>
        <Button size="sm" variant="outline">Export Rates</Button>
      </div>
      <div className="text-center py-8">
        <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No pricing configured</p>
      </div>
    </div>
  );
}

function SuppliersDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Approved Suppliers</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Supplier</Button>
      </div>
      <div className="text-center py-8">
        <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No suppliers linked</p>
      </div>
    </div>
  );
}

function IntegrationsDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Connected Integrations</h3>
        <Button size="sm"><Link className="h-4 w-4 mr-1" /> Connect</Button>
      </div>
      <div className="text-center py-8">
        <Link className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No integrations connected</p>
      </div>
    </div>
  );
}

function ShippingDrawerContent({ clientId }: { clientId: string }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Shipping Rules</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>
      </div>
      <div className="text-center py-8">
        <Truck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No shipping rules configured</p>
      </div>
    </div>
  );
}

// User Drawer Content Components
function RolePermissionsDrawerContent({ role }: { role: any }) {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-semibold">Role Permissions</h3>
      <div className="text-center py-8">
        <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No permissions configured</p>
      </div>
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
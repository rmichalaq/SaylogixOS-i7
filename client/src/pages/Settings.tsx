import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertWarehouseZoneSchema, insertStaffRoleSchema, insertToteCartTypeSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("zones");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Warehouse Zones
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["/api/warehouse-zones"],
  });

  const createZoneMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertWarehouseZoneSchema>) =>
      fetch("/api/warehouse-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-zones"] });
      toast({ title: "Zone created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create zone", variant: "destructive" });
    }
  });

  const updateZoneMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<z.infer<typeof insertWarehouseZoneSchema>>) =>
      fetch(`/api/warehouse-zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-zones"] });
      toast({ title: "Zone updated successfully" });
    },
  });

  // Staff Roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/staff-roles"],
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertStaffRoleSchema>) =>
      fetch("/api/staff-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-roles"] });
      toast({ title: "Role created successfully" });
    },
  });

  // Tote Cart Types
  const { data: toteTypes = [], isLoading: toteTypesLoading } = useQuery({
    queryKey: ["/api/tote-cart-types"],
  });

  const createToteTypeMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertToteCartTypeSchema>) =>
      fetch("/api/tote-cart-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tote-cart-types"] });
      toast({ title: "Tote type created successfully" });
    },
  });

  const ZoneForm = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
    const form = useForm({
      resolver: zodResolver(insertWarehouseZoneSchema),
      defaultValues: { name: "", description: "", isActive: true },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => { onSubmit(data); onClose(); })} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zone Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter zone name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Zone</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const RoleForm = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
    const form = useForm({
      resolver: zodResolver(insertStaffRoleSchema),
      defaultValues: { title: "", description: "", permissions: [], isActive: true },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => { onSubmit(data); onClose(); })} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter role title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Role</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  const ToteTypeForm = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
    const form = useForm({
      resolver: zodResolver(insertToteCartTypeSchema),
      defaultValues: { name: "", type: "tote", capacity: 0, isActive: true },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => { onSubmit(data); onClose(); })} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select className="w-full p-2 border rounded" {...field}>
                    <option value="tote">Tote</option>
                    <option value="cart">Cart</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter capacity" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Tote Type</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage warehouse zones, staff roles, and equipment types</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zones">Warehouse Zones</TabsTrigger>
          <TabsTrigger value="roles">Staff Roles</TabsTrigger>
          <TabsTrigger value="totes">Tote & Cart Types</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Warehouse Zones</CardTitle>
                <CardDescription>Manage warehouse zones and locations</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Zone</DialogTitle>
                    <DialogDescription>Add a new warehouse zone or location</DialogDescription>
                  </DialogHeader>
                  <ZoneForm 
                    onSubmit={(data) => createZoneMutation.mutate(data)} 
                    onClose={() => {}} 
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {zonesLoading ? (
                <div>Loading zones...</div>
              ) : (
                <div className="space-y-4">
                  {zones.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No warehouse zones configured</p>
                  ) : (
                    zones.map((zone: any) => (
                      <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{zone.name}</h3>
                          <p className="text-sm text-gray-600">{zone.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={zone.isActive} 
                            onCheckedChange={(checked) => 
                              updateZoneMutation.mutate({ id: zone.id, isActive: checked })
                            }
                          />
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Roles</CardTitle>
                <CardDescription>Manage staff roles and permissions</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>Add a new staff role</DialogDescription>
                  </DialogHeader>
                  <RoleForm 
                    onSubmit={(data) => createRoleMutation.mutate(data)} 
                    onClose={() => {}} 
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div>Loading roles...</div>
              ) : (
                <div className="space-y-4">
                  {roles.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No staff roles configured</p>
                  ) : (
                    roles.map((role: any) => (
                      <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{role.title}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={role.isActive} />
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="totes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tote & Cart Types</CardTitle>
                <CardDescription>Manage tote and cart configurations</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Type
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Tote/Cart Type</DialogTitle>
                    <DialogDescription>Add a new tote or cart type</DialogDescription>
                  </DialogHeader>
                  <ToteTypeForm 
                    onSubmit={(data) => createToteTypeMutation.mutate(data)} 
                    onClose={() => {}} 
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {toteTypesLoading ? (
                <div>Loading tote types...</div>
              ) : (
                <div className="space-y-4">
                  {toteTypes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No tote/cart types configured</p>
                  ) : (
                    toteTypes.map((toteType: any) => (
                      <div key={toteType.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{toteType.name}</h3>
                          <p className="text-sm text-gray-600">
                            {toteType.type} • Capacity: {toteType.capacity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={toteType.isActive} />
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
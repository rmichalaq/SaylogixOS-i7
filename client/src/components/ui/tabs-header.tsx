import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TabsHeaderProps {
  children?: React.ReactNode;
  tabs: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  actions?: React.ReactNode;
}

export function TabsHeader({ 
  children, 
  tabs, 
  defaultValue, 
  value, 
  onValueChange,
  actions 
}: TabsHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <Tabs defaultValue={defaultValue} value={value} onValueChange={onValueChange}>
          <div className="flex items-center justify-between w-full">
            <TabsList className="grid w-full grid-cols-6 max-w-2xl">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="relative">
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions && (
              <div className="flex items-center space-x-2 ml-4">
                {actions}
              </div>
            )}
          </div>
          {children}
        </Tabs>
      </div>
    </div>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
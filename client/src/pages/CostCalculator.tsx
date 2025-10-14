import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CostCalculator() {
  const [teamSize, setTeamSize] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});

  const handleServiceQuantityChange = (serviceId: string, delta: number) => {
    setSelectedServices(prev => {
      const current = prev[serviceId] || 0;
      const newValue = Math.max(0, current + delta);
      
      if (newValue === 0) {
        const { [serviceId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [serviceId]: newValue };
    });
  };

  const getPricePerUser = (price: string): number => {
    if (price === 'Free') return 0;
    if (price === 'Freemium') return 0;
    const match = price.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const calculateTotal = () => {
    return Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
      const service = MOCK_SERVICES.find(s => s.id === serviceId);
      if (!service) return total;
      
      const pricePerUser = getPricePerUser(service.price);
      return total + (pricePerUser * quantity * teamSize);
    }, 0);
  };

  const totalCost = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-calculator-title">
            Cost Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Estimate your team's monthly AI tools budget
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Team Configuration</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="team-size">Team Size</Label>
                  <Input
                    id="team-size"
                    type="number"
                    min="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
                    data-testid="input-team-size"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of team members who will use these tools
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Select Services</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_SERVICES.map(service => {
                    const quantity = selectedServices[service.id] || 0;
                    const pricePerUser = getPricePerUser(service.price);
                    
                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border border-border rounded-md hover-elevate"
                        data-testid={`service-item-${service.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="flex items-center justify-center h-10 w-10 rounded-md text-xl flex-shrink-0"
                            style={{ backgroundColor: service.color }}
                          >
                            {service.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm">{service.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {service.price}
                              </Badge>
                              {pricePerUser > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ${pricePerUser}/user/mo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleServiceQuantityChange(service.id, -1)}
                            disabled={quantity === 0}
                            data-testid={`button-decrease-${service.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleServiceQuantityChange(service.id, 1)}
                            data-testid={`button-increase-${service.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <h2 className="text-xl font-semibold">Cost Summary</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team Size</span>
                    <span className="font-medium">{teamSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Services Selected</span>
                    <span className="font-medium">
                      {Object.keys(selectedServices).length}
                    </span>
                  </div>
                </div>

                {Object.keys(selectedServices).length > 0 && (
                  <>
                    <div className="border-t border-border pt-4 space-y-2">
                      {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                        const service = MOCK_SERVICES.find(s => s.id === serviceId);
                        if (!service) return null;
                        
                        const pricePerUser = getPricePerUser(service.price);
                        const serviceCost = pricePerUser * quantity * teamSize;
                        
                        return (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span className="text-muted-foreground truncate mr-2">
                              {service.name} × {quantity}
                            </span>
                            <span className="font-medium whitespace-nowrap">
                              ${serviceCost}/mo
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">Total</span>
                    <div className="text-right">
                      <p className="text-3xl font-bold" data-testid="text-total-cost">
                        ${totalCost}
                      </p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                  </div>
                </div>

                {totalCost > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                    <p>Annual cost: <strong className="text-foreground">${totalCost * 12}</strong></p>
                    <p className="mt-1">Per user/month: <strong className="text-foreground">${(totalCost / teamSize).toFixed(2)}</strong></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

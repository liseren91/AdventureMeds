import { useState } from "react";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, X, Check, Minus } from "lucide-react";

export default function Compare() {
  //todo: remove mock functionality - get from localStorage or state management
  const [comparingIds, setComparingIds] = useState<string[]>(["1", "2", "5"]);

  const handleRemove = (serviceId: string) => {
    setComparingIds(prev => prev.filter(id => id !== serviceId));
  };

  const handleClearAll = () => {
    setComparingIds([]);
  };

  const comparingServices = MOCK_SERVICES.filter(service => 
    comparingIds.includes(service.id)
  );

  const allFeatures = Array.from(
    new Set(comparingServices.flatMap(s => s.features))
  );

  const hasFeature = (service: typeof comparingServices[0], feature: string) => {
    return service.features.includes(feature);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" data-testid="text-compare-title">
              Compare Services
            </h1>
            <p className="text-muted-foreground mt-2">
              {comparingServices.length} service{comparingServices.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {comparingServices.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              data-testid="button-clear-comparison"
            >
              Clear All
            </Button>
          )}
        </div>

        {comparingServices.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-muted-foreground mb-4">No services to compare</p>
            <p className="text-sm text-muted-foreground">
              Add services to comparison from the main catalog
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(280px,1fr))] gap-4">
                <div className="space-y-4">
                  <div className="h-48"></div>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Basic Info</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>Rating</p>
                      <p>Price</p>
                      <p>Category</p>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Pricing Tiers</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      {comparingServices[0]?.pricingTiers.map((tier: any) => (
                        <p key={tier.name}>{tier.name}</p>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Features</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      {allFeatures.map(feature => (
                        <p key={feature}>{feature}</p>
                      ))}
                    </div>
                  </Card>
                </div>

                {comparingServices.map(service => (
                  <div key={service.id} className="space-y-4">
                    <Card className="relative">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 z-10"
                        onClick={() => handleRemove(service.id)}
                        data-testid={`button-remove-${service.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardHeader className="space-y-3 pb-3">
                        <div 
                          className="flex items-center justify-center h-16 w-16 rounded-md text-3xl mx-auto"
                          style={{ backgroundColor: service.color }}
                        >
                          {service.icon}
                        </div>
                        <div className="text-center space-y-1">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.subtitle}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground text-center">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">{service.rating}</span>
                        </div>
                        <Badge variant="secondary">{service.price}</Badge>
                        <p className="text-muted-foreground capitalize">{service.category}</p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-3 text-sm">
                        {service.pricingTiers.map((tier: any) => (
                          <p key={tier.name} className="font-medium">{tier.price}</p>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-3">
                        {allFeatures.map(feature => (
                          <div key={feature} className="flex items-center justify-center">
                            {hasFeature(service, feature) ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Minus className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

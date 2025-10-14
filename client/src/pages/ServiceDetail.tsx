import { useRoute } from "wouter";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, GitCompare, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

export default function ServiceDetail() {
  const [, params] = useRoute("/service/:id");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const service = MOCK_SERVICES.find(s => s.id === params?.id);

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service not found</h1>
          <p className="text-muted-foreground">The service you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    console.log(`${service.name} ${!isFavorite ? 'added to' : 'removed from'} favorites`);
  };

  const handleCompareToggle = () => {
    setIsComparing(!isComparing);
    console.log(`${service.name} ${!isComparing ? 'added to' : 'removed from'} comparison`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <Card className="border-card-border">
          <CardHeader className="space-y-6 pb-6">
            <div className="flex items-start gap-6">
              <div 
                className="flex items-center justify-center h-24 w-24 rounded-md text-4xl flex-shrink-0"
                style={{ backgroundColor: service.color }}
              >
                {service.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2" data-testid="text-service-detail-name">
                      {service.name}
                    </h1>
                    <p className="text-lg text-muted-foreground">{service.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      onClick={handleFavoriteToggle}
                      className="gap-2"
                      data-testid="button-favorite-detail"
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      variant={isComparing ? "default" : "outline"}
                      onClick={handleCompareToggle}
                      className="gap-2"
                      data-testid="button-compare-detail"
                    >
                      <GitCompare className="h-4 w-4" />
                      {isComparing ? 'Comparing' : 'Compare'}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold text-lg">{service.rating}</span>
                  </div>
                  <Badge variant="secondary" className="text-sm">{service.price}</Badge>
                  <Badge variant="outline" className="text-sm capitalize">{service.category}</Badge>
                  {service.website && (
                    <a href={service.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" className="gap-2 px-2">
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6 border-t">
            <div>
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{service.fullDescription}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Pricing Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {service.pricingTiers.map((tier: any, index: number) => (
                  <Card key={index} className={index === 1 ? 'border-primary' : ''}>
                    <CardHeader className="pb-4">
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-2xl font-bold">{tier.price}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tier.features.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Use Cases</h2>
              <div className="flex flex-wrap gap-2">
                {service.useCases.map((useCase, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {useCase}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Related Services</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Discover similar AI tools in the {service.category} category
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

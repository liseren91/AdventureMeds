import { useRoute, useLocation, Link } from "wouter";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, GitCompare, ExternalLink, Check } from "lucide-react";
import { useEffect } from "react";
import RecommendedServices from "@/components/RecommendedServices";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ServiceDetail() {
  const [, params] = useRoute("/service/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { favorites, comparing, toggleFavorite, toggleCompare, addToHistory, setSelectedCategory } = useApp();

  const service = MOCK_SERVICES.find(s => s.id === params?.id);

  useEffect(() => {
    if (service) {
      addToHistory(service.id);
    }
  }, [service?.id]);

  const handleRecommendedServiceClick = (serviceId: string) => {
    setLocation(`/service/${serviceId}`);
  };

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
    if (service) {
      toggleFavorite(service.id);
    }
  };

  const handleCompareToggle = () => {
    if (service) {
      const success = toggleCompare(service.id);
      if (!success && !comparing.has(service.id)) {
        toast({
          title: "Comparison limit reached",
          description: "You can compare up to 4 services at once",
          variant: "destructive",
        });
      }
    }
  };

  const isFavorite = service ? favorites.has(service.id) : false;
  const isComparing = service ? comparing.has(service.id) : false;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb data-testid="breadcrumb-service-detail">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-breadcrumb-home">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(service.category);
                    setLocation('/');
                  }}
                  data-testid="link-breadcrumb-category"
                >
                  {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="text-breadcrumb-service">{service.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-card-border">
          <CardHeader className="space-y-6 pb-6">
            <div className="flex items-start gap-6">
              <div 
                className="flex items-center justify-center h-24 w-24 rounded-md overflow-hidden flex-shrink-0"
                style={{ backgroundColor: service.logoUrl ? '#ffffff' : service.color }}
              >
                {service.logoUrl ? (
                  <img 
                    src={service.logoUrl} 
                    alt={`${service.name} logo`} 
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.style.backgroundColor = service.color;
                        parent.innerHTML = `<span class="text-4xl font-bold text-white">${service.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">{service.name.charAt(0)}</span>
                )}
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
                  <Badge variant="secondary" className="text-sm">{formatPrice(service.price)}</Badge>
                  <Badge 
                    variant="outline" 
                    className="text-sm capitalize cursor-pointer hover-elevate" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(service.category);
                      setLocation('/');
                    }}
                    data-testid="badge-category"
                  >
                    {service.category}
                  </Badge>
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

        <RecommendedServices
          currentServiceId={service.id}
          category={service.category}
          onServiceClick={handleRecommendedServiceClick}
        />
      </div>
    </div>
  );
}

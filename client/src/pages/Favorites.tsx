import { useLocation, Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { favorites, comparing, toggleFavorite, toggleCompare, clearFavorites, addToHistory } = useApp();

  const handleFavoriteToggle = (serviceId: string, isFavorite: boolean) => {
    toggleFavorite(serviceId);
  };

  const handleCompareToggle = (serviceId: string, isComparing: boolean) => {
    const success = toggleCompare(serviceId);
    if (!success) {
      toast({
        title: "Comparison limit reached",
        description: "You can compare up to 4 services at once",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      clearFavorites();
    }
  };

  const handleExport = () => {
    const favoriteServices = MOCK_SERVICES.filter(s => favorites.has(s.id));
    const data = favoriteServices.map(s => ({
      name: s.name,
      subtitle: s.subtitle,
      category: s.category,
      price: s.price,
      rating: s.rating,
      website: s.website || '',
    }));
    
    import('@/lib/exportUtils').then(({ exportToCSV }) => {
      exportToCSV(data, 'my-favorites');
    });
  };

  const handleServiceClick = (serviceId: string) => {
    addToHistory(serviceId);
    setLocation(`/service/${serviceId}`);
  };

  const favoriteServices = MOCK_SERVICES.filter(service => favorites.has(service.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb data-testid="breadcrumb-favorites">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-breadcrumb-home">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="text-breadcrumb-favorites">Favorites</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" data-testid="text-favorites-title">
              My Favorites
            </h1>
            <p className="text-muted-foreground mt-2" data-testid="text-favorites-count">
              {favoriteServices.length} saved service{favoriteServices.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2"
              disabled={favoriteServices.length === 0}
              data-testid="button-export-favorites"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="gap-2"
              disabled={favoriteServices.length === 0}
              data-testid="button-clear-favorites"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>

        {favoriteServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteServices.map(service => (
              <ServiceCard
                key={service.id}
                id={service.id}
                name={service.name}
                subtitle={service.subtitle}
                description={service.description}
                price={service.price}
                rating={service.rating}
                icon={service.icon}
                color={service.color}
                logoUrl={service.logoUrl}
                onFavoriteToggle={handleFavoriteToggle}
                onCompareToggle={handleCompareToggle}
                onClick={() => handleServiceClick(service.id)}
                isFavorite={favorites.has(service.id)}
                isComparing={comparing.has(service.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-xl text-muted-foreground mb-4">No favorites yet</p>
            <p className="text-sm text-muted-foreground">
              Start adding services to your favorites to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

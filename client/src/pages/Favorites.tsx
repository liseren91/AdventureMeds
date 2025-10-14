import { useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

export default function Favorites() {
  //todo: remove mock functionality - get from localStorage or API
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1", "3", "5"]));
  const [comparing, setComparing] = useState<Set<string>>(new Set());

  const handleFavoriteToggle = (serviceId: string, isFavorite: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.add(serviceId);
      } else {
        newFavorites.delete(serviceId);
      }
      return newFavorites;
    });
  };

  const handleCompareToggle = (serviceId: string, isComparing: boolean) => {
    setComparing(prev => {
      const newComparing = new Set(prev);
      if (isComparing) {
        if (newComparing.size >= 4) {
          console.log('Maximum 4 services can be compared');
          return prev;
        }
        newComparing.add(serviceId);
      } else {
        newComparing.delete(serviceId);
      }
      return newComparing;
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      setFavorites(new Set());
    }
  };

  const handleExport = () => {
    const favoriteServices = MOCK_SERVICES.filter(s => favorites.has(s.id));
    console.log('Exporting favorites:', favoriteServices);
  };

  const handleServiceClick = (serviceId: string) => {
    console.log('Navigating to service details:', serviceId);
  };

  const favoriteServices = MOCK_SERVICES.filter(service => favorites.has(service.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
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

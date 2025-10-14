import { useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function History() {
  //todo: remove mock functionality - get from localStorage or API
  const [historyIds] = useState<string[]>(["2", "4", "6", "1", "3"]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
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

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your viewing history?')) {
      console.log('Clearing history...');
    }
  };

  const handleServiceClick = (serviceId: string) => {
    console.log('Navigating to service details:', serviceId);
  };

  const historyServices = MOCK_SERVICES.filter(service => historyIds.includes(service.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight" data-testid="text-history-title">
              Viewing History
            </h1>
            <p className="text-muted-foreground mt-2">
              Recently viewed services
            </p>
          </div>

          <Button
            onClick={handleClearHistory}
            variant="outline"
            className="gap-2"
            data-testid="button-clear-history"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        </div>

        {historyServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyServices.map(service => (
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
            <p className="text-xl text-muted-foreground mb-4">No viewing history</p>
            <p className="text-sm text-muted-foreground">
              Services you view will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

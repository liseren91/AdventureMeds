import { useLocation, Link } from "wouter";
import ServiceCard from "@/components/ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

export default function History() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { history, favorites, comparing, toggleFavorite, toggleCompare, clearHistory, addToHistory } = useApp();
  const historyIds = history;

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

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your viewing history?')) {
      clearHistory();
    }
  };

  const handleServiceClick = (serviceId: string) => {
    addToHistory(serviceId);
    setLocation(`/service/${serviceId}`);
  };

  const historyServices = MOCK_SERVICES.filter(service => historyIds.includes(service.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb data-testid="breadcrumb-history">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-breadcrumb-home">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="text-breadcrumb-history">History</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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

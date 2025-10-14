import ServiceCard from "./ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";

interface RecommendedServicesProps {
  currentServiceId: string;
  category: string;
  onServiceClick: (serviceId: string) => void;
}

export default function RecommendedServices({
  currentServiceId,
  category,
  onServiceClick,
}: RecommendedServicesProps) {
  const [, setLocation] = useLocation();
  const { setSelectedCategory } = useApp();

  //todo: remove mock functionality - implement real recommendation algorithm
  const recommendedServices = MOCK_SERVICES
    .filter(service => 
      service.id !== currentServiceId && service.category === category
    )
    .slice(0, 3);

  if (recommendedServices.length === 0) {
    return null;
  }

  const handleViewAllSimilar = () => {
    setSelectedCategory(category);
    setLocation('/');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Similar Services</h2>
        <Button 
          variant="outline" 
          onClick={handleViewAllSimilar}
          className="gap-2"
          data-testid="button-find-similar"
        >
          View All {category.charAt(0).toUpperCase() + category.slice(1)}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedServices.map(service => (
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
            onClick={() => onServiceClick(service.id)}
          />
        ))}
      </div>
    </div>
  );
}

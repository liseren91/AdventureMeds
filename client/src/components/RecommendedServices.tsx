import ServiceCard from "./ServiceCard";
import { MOCK_SERVICES } from "@/lib/mockData";

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
  //todo: remove mock functionality - implement real recommendation algorithm
  const recommendedServices = MOCK_SERVICES
    .filter(service => 
      service.id !== currentServiceId && service.category === category
    )
    .slice(0, 3);

  if (recommendedServices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Similar Services</h2>
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
            onClick={() => onServiceClick(service.id)}
          />
        ))}
      </div>
    </div>
  );
}

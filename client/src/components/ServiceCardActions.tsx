import { Button } from "@/components/ui/button";
import { Heart, GitCompare } from "lucide-react";
import { useState } from "react";

interface ServiceCardActionsProps {
  serviceId: string;
  serviceName: string;
  onFavoriteToggle?: (serviceId: string, isFavorite: boolean) => void;
  onCompareToggle?: (serviceId: string, isComparing: boolean) => void;
  initialFavorite?: boolean;
  initialComparing?: boolean;
}

export default function ServiceCardActions({
  serviceId,
  serviceName,
  onFavoriteToggle,
  onCompareToggle,
  initialFavorite = false,
  initialComparing = false,
}: ServiceCardActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isComparing, setIsComparing] = useState(initialComparing);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    onFavoriteToggle?.(serviceId, newFavorite);
    console.log(`${serviceName} ${newFavorite ? 'added to' : 'removed from'} favorites`);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newComparing = !isComparing;
    setIsComparing(newComparing);
    onCompareToggle?.(serviceId, newComparing);
    console.log(`${serviceName} ${newComparing ? 'added to' : 'removed from'} comparison`);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handleFavoriteClick}
        className={isFavorite ? "text-red-500" : ""}
        data-testid={`button-favorite-${serviceId}`}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleCompareClick}
        className={isComparing ? "text-primary" : ""}
        data-testid={`button-compare-${serviceId}`}
      >
        <GitCompare className="h-4 w-4" />
      </Button>
    </div>
  );
}

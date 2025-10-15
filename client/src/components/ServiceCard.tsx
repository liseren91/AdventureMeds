import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart, GitCompare } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface ServiceCardProps {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: string;
  rating: string;
  icon: string;
  color: string;
  logoUrl?: string;
  onFavoriteToggle?: (serviceId: string, isFavorite: boolean) => void;
  onCompareToggle?: (serviceId: string, isComparing: boolean) => void;
  onClick?: () => void;
  isFavorite?: boolean;
  isComparing?: boolean;
}

export default function ServiceCard({
  id,
  name,
  subtitle,
  description,
  price,
  rating,
  icon,
  color,
  logoUrl,
  onFavoriteToggle,
  onCompareToggle,
  onClick,
  isFavorite = false,
  isComparing = false,
}: ServiceCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [comparing, setComparing] = useState(isComparing);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorite = !favorite;
    setFavorite(newFavorite);
    onFavoriteToggle?.(id, newFavorite);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newComparing = !comparing;
    setComparing(newComparing);
    onCompareToggle?.(id, newComparing);
  };

  return (
    <Card 
      className="hover-elevate transition-all duration-200 cursor-pointer" 
      onClick={onClick}
      data-testid={`card-service-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div 
            className="flex items-center justify-center h-12 w-12 rounded-md overflow-hidden flex-shrink-0"
            style={{ backgroundColor: logoUrl ? '#ffffff' : color }}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${name} logo`} 
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.style.backgroundColor = color;
                    parent.innerHTML = `<span class="text-2xl font-bold text-white">${name.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs" data-testid={`badge-price-${name.toLowerCase().replace(/\s+/g, '-')}`}>
              {formatPrice(price)}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFavoriteClick}
              className={favorite ? "text-red-500" : ""}
              data-testid={`button-favorite-${id}`}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base leading-tight" data-testid={`text-service-name-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="font-medium" data-testid={`text-rating-${name.toLowerCase().replace(/\s+/g, '-')}`}>{rating}</span>
          </div>
          <Button
            size="sm"
            variant={comparing ? "default" : "outline"}
            onClick={handleCompareClick}
            className="gap-2"
            data-testid={`button-compare-${id}`}
          >
            <GitCompare className="h-4 w-4" />
            {comparing ? "В сравнении" : "К сравнению"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

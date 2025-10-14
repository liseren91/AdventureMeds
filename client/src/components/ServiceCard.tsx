import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ServiceCardProps {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  rating: string;
  icon: string;
  color: string;
}

export default function ServiceCard({
  name,
  subtitle,
  description,
  price,
  rating,
  icon,
  color,
}: ServiceCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-service-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div 
            className="flex items-center justify-center h-12 w-12 rounded-md text-2xl flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <Badge variant="secondary" className="text-xs" data-testid={`badge-price-${name.toLowerCase().replace(/\s+/g, '-')}`}>
            {price}
          </Badge>
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
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="font-medium" data-testid={`text-rating-${name.toLowerCase().replace(/\s+/g, '-')}`}>{rating}</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star, Sparkles, TrendingUp, Gift, Users } from "lucide-react";

interface FilterPanelProps {
  category: string;
  onCategoryChange: (value: string) => void;
  priceFilters: {
    free: boolean;
    freemium: boolean;
    paid: boolean;
  };
  onPriceFilterChange: (filter: keyof FilterPanelProps['priceFilters']) => void;
  rating: string;
  onRatingChange: (value: string) => void;
  features: string[];
  onFeaturesChange: (features: string[]) => void;
  useCases: string[];
  onUseCasesChange: (useCases: string[]) => void;
  hasFreeTierOnly: boolean;
  onHasFreeTierChange: (value: boolean) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  newness: string;
  onNewnessChange: (value: string) => void;
  teamSize: string[];
  onTeamSizeChange: (teamSize: string[]) => void;
  quickFilter: string;
  onQuickFilterChange: (filter: string) => void;
  onReset: () => void;
}

const POPULAR_FEATURES = [
  "API Access",
  "Mobile App",
  "Browser Extension",
  "Team Collaboration",
  "Multi-language",
  "Integrations",
  "SEO Tools",
];

const COMMON_USE_CASES = [
  "Content Marketing",
  "SEO",
  "Social Media",
  "Email Marketing",
  "Design",
  "Marketing",
  "Data Analysis",
];

const TEAM_SIZES = [
  { value: "individual", label: "Individual" },
  { value: "small", label: "Small (2-10)" },
  { value: "medium", label: "Medium (10-100)" },
  { value: "enterprise", label: "Enterprise (100+)" },
];

const QUICK_FILTERS = [
  { value: "popular", label: "Popular", icon: TrendingUp },
  { value: "new", label: "New", icon: Sparkles },
  { value: "free", label: "Best Free", icon: Gift },
  { value: "teams", label: "For Teams", icon: Users },
];

export default function FilterPanel({
  category,
  onCategoryChange,
  priceFilters,
  onPriceFilterChange,
  rating,
  onRatingChange,
  features,
  onFeaturesChange,
  useCases,
  onUseCasesChange,
  hasFreeTierOnly,
  onHasFreeTierChange,
  priceRange,
  onPriceRangeChange,
  newness,
  onNewnessChange,
  teamSize,
  onTeamSizeChange,
  quickFilter,
  onQuickFilterChange,
  onReset,
}: FilterPanelProps) {
  const toggleFeature = (feature: string) => {
    if (features.includes(feature)) {
      onFeaturesChange(features.filter(f => f !== feature));
    } else {
      onFeaturesChange([...features, feature]);
    }
  };

  const toggleUseCase = (useCase: string) => {
    if (useCases.includes(useCase)) {
      onUseCasesChange(useCases.filter(u => u !== useCase));
    } else {
      onUseCasesChange([...useCases, useCase]);
    }
  };

  const toggleTeamSize = (size: string) => {
    if (teamSize.includes(size)) {
      onTeamSizeChange(teamSize.filter(s => s !== size));
    } else {
      onTeamSizeChange([...teamSize, size]);
    }
  };

  return (
    <div className="w-72 bg-card border border-card-border rounded-md p-6 space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Quick Filters</Label>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
              <Badge
                key={filter.value}
                variant={quickFilter === filter.value ? "default" : "outline"}
                className="cursor-pointer hover-elevate active-elevate-2"
                onClick={() => onQuickFilterChange(filter.value === quickFilter ? "" : filter.value)}
                data-testid={`badge-quick-${filter.value}`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger data-testid="select-category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="copywriting">Copywriting</SelectItem>
            <SelectItem value="design">Design & Visuals</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="text">Text Processing</SelectItem>
            <SelectItem value="chat">Chat & AI</SelectItem>
            <SelectItem value="social">Social Media</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-free-tier"
                checked={hasFreeTierOnly}
                onCheckedChange={onHasFreeTierChange}
                data-testid="checkbox-has-free-tier"
              />
              <Label htmlFor="has-free-tier" className="text-sm font-normal cursor-pointer">
                Has free tier
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Price Type</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free"
                    checked={priceFilters.free}
                    onCheckedChange={() => onPriceFilterChange('free')}
                    data-testid="checkbox-price-free"
                  />
                  <Label htmlFor="free" className="text-sm font-normal cursor-pointer">
                    Free
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="freemium"
                    checked={priceFilters.freemium}
                    onCheckedChange={() => onPriceFilterChange('freemium')}
                    data-testid="checkbox-price-freemium"
                  />
                  <Label htmlFor="freemium" className="text-sm font-normal cursor-pointer">
                    Freemium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid"
                    checked={priceFilters.paid}
                    onCheckedChange={() => onPriceFilterChange('paid')}
                    data-testid="checkbox-price-paid"
                  />
                  <Label htmlFor="paid" className="text-sm font-normal cursor-pointer">
                    Paid
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Price Range</Label>
              <Select value={priceRange} onValueChange={onPriceRangeChange}>
                <SelectTrigger data-testid="select-price-range">
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any price</SelectItem>
                  <SelectItem value="0-10">Up to $10/mo</SelectItem>
                  <SelectItem value="10-50">$10-$50/mo</SelectItem>
                  <SelectItem value="50-100">$50-$100/mo</SelectItem>
                  <SelectItem value="100+">$100+/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Rating
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {['5.0', '4.0+', '3.0+'].map((ratingValue) => (
              <div key={ratingValue} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${ratingValue}`}
                  checked={rating === ratingValue}
                  onCheckedChange={() => onRatingChange(ratingValue)}
                  data-testid={`checkbox-rating-${ratingValue}`}
                />
                <Label
                  htmlFor={`rating-${ratingValue}`}
                  className="text-sm font-normal cursor-pointer flex items-center gap-1"
                >
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {ratingValue}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Features
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {POPULAR_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                  data-testid={`checkbox-feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label
                  htmlFor={`feature-${feature}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="use-cases">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Use Cases
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {COMMON_USE_CASES.map((useCase) => (
              <div key={useCase} className="flex items-center space-x-2">
                <Checkbox
                  id={`usecase-${useCase}`}
                  checked={useCases.includes(useCase)}
                  onCheckedChange={() => toggleUseCase(useCase)}
                  data-testid={`checkbox-usecase-${useCase.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label
                  htmlFor={`usecase-${useCase}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {useCase}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="team-size">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Team Size
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            {TEAM_SIZES.map((size) => (
              <div key={size.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`teamsize-${size.value}`}
                  checked={teamSize.includes(size.value)}
                  onCheckedChange={() => toggleTeamSize(size.value)}
                  data-testid={`checkbox-teamsize-${size.value}`}
                />
                <Label
                  htmlFor={`teamsize-${size.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {size.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="newness">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline">
            Newness
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <Select value={newness} onValueChange={onNewnessChange}>
              <SelectTrigger data-testid="select-newness">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any time</SelectItem>
                <SelectItem value="1month">Last month</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
                <SelectItem value="6months">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
        data-testid="button-reset-filters"
      >
        Reset All
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

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
  onReset: () => void;
}

export default function FilterPanel({
  category,
  onCategoryChange,
  priceFilters,
  onPriceFilterChange,
  rating,
  onRatingChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="w-72 bg-card border border-card-border rounded-md p-6 space-y-6">
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Price</Label>
        <div className="space-y-3">
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Rating</Label>
        <div className="space-y-3">
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
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={onReset}
        data-testid="button-reset-filters"
      >
        Reset
      </Button>
    </div>
  );
}

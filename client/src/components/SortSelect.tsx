import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

export type SortOption = 'rating-desc' | 'rating-asc' | 'popularity' | 'newest' | 'price-asc' | 'price-desc';

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]" data-testid="select-sort">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating-desc">Highest Rated</SelectItem>
          <SelectItem value="rating-asc">Lowest Rated</SelectItem>
          <SelectItem value="popularity">Most Popular</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

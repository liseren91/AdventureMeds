import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex gap-2 w-full max-w-4xl">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search the catalog…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="pl-12 h-12 text-base bg-card border-card-border"
          data-testid="input-search"
        />
      </div>
      <Button 
        size="lg" 
        onClick={onSearch}
        className="px-8 h-12"
        data-testid="button-ai-search"
      >
        AI Search
      </Button>
    </div>
  );
}

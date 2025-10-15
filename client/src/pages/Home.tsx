import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ServiceCard from "@/components/ServiceCard";
import SortSelect, { type SortOption } from "@/components/SortSelect";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Download, GitCompare } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { favorites, comparing, selectedCategory, setSelectedCategory, toggleFavorite, toggleCompare, addToHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilters, setPriceFilters] = useState({
    free: false,
    freemium: false,
    paid: false,
  });
  const [rating, setRating] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [features, setFeatures] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [hasFreeTierOnly, setHasFreeTierOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [newness, setNewness] = useState("all");
  const [teamSize, setTeamSize] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState("");

  const handlePriceFilterChange = (filter: 'free' | 'freemium' | 'paid') => {
    setPriceFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleQuickFilterChange = (filter: string) => {
    // Reset other filters when applying quick filter
    if (filter === "") {
      setQuickFilter("");
      return;
    }

    setQuickFilter(filter);
    
    // Reset all filters first
    setPriceFilters({ free: false, freemium: false, paid: false });
    setRating("");
    setFeatures([]);
    setUseCases([]);
    setHasFreeTierOnly(false);
    setPriceRange("all");
    setNewness("all");
    setTeamSize([]);

    // Apply quick filter presets
    switch (filter) {
      case "popular":
        setSortBy("popularity");
        setRating("4.0+");
        break;
      case "new":
        setNewness("3months");
        setSortBy("newest");
        break;
      case "free":
        setHasFreeTierOnly(true);
        setSortBy("rating-desc");
        break;
      case "teams":
        setTeamSize(["small", "medium", "enterprise"]);
        setFeatures(["Team Collaboration"]);
        break;
    }
  };

  const handleReset = () => {
    setSelectedCategory("all");
    setPriceFilters({ free: false, freemium: false, paid: false });
    setRating("");
    setSearchQuery("");
    setSortBy("popularity");
    setFeatures([]);
    setUseCases([]);
    setHasFreeTierOnly(false);
    setPriceRange("all");
    setNewness("all");
    setTeamSize([]);
    setQuickFilter("");
  };

  const handleSearch = () => {
    // Search is triggered automatically via filteredAndSortedServices
  };

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

  const handleExport = () => {
    const data = filteredAndSortedServices.map(s => ({
      name: s.name,
      subtitle: s.subtitle,
      category: s.category,
      price: s.price,
      rating: s.rating,
      website: s.website || '',
    }));
    
    import('@/lib/exportUtils').then(({ exportToCSV }) => {
      exportToCSV(data, 'ai-services');
    });
  };

  const handleCompare = () => {
    setLocation("/compare");
  };

  const handleServiceClick = (serviceId: string) => {
    addToHistory(serviceId);
    setLocation(`/service/${serviceId}`);
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = MOCK_SERVICES.filter(service => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;

      // Price type filter
      const matchesPrice = 
        (!priceFilters.free && !priceFilters.freemium && !priceFilters.paid) ||
        (priceFilters.free && service.price === "Free") ||
        (priceFilters.freemium && service.price === "Freemium") ||
        (priceFilters.paid && service.price.includes("$"));

      // Rating filter
      const matchesRating = 
        rating === "" ||
        (rating === "5.0" && parseFloat(service.rating) === 5.0) ||
        (rating === "4.0+" && parseFloat(service.rating) >= 4.0) ||
        (rating === "3.0+" && parseFloat(service.rating) >= 3.0);

      // Features filter
      const matchesFeatures = features.length === 0 || 
        features.every(feature => service.popularFeatures?.includes(feature));

      // Use cases filter
      const matchesUseCases = useCases.length === 0 || 
        useCases.some(useCase => service.commonUseCases?.includes(useCase));

      // Free tier filter
      const matchesFreeTier = !hasFreeTierOnly || service.hasFreeTier;

      // Price range filter
      const matchesPriceRange = (() => {
        if (priceRange === "all") return true;
        
        const getPrice = (price: string) => {
          if (price === 'Free') return 0;
          if (price === 'Freemium') return 0; // Freemium has free tier
          const match = price.match(/\$(\d+)/);
          return match ? parseInt(match[1]) : 999;
        };
        
        const price = getPrice(service.price);
        
        switch (priceRange) {
          case "0-10": return price <= 10;
          case "10-50": return price > 10 && price <= 50;
          case "50-100": return price > 50 && price <= 100;
          case "100+": return price > 100;
          default: return true;
        }
      })();

      // Newness filter
      const matchesNewness = (() => {
        if (newness === "all") return true;
        
        const now = new Date();
        const serviceDate = service.createdAt;
        const monthsDiff = (now.getFullYear() - serviceDate.getFullYear()) * 12 + 
          (now.getMonth() - serviceDate.getMonth());
        
        switch (newness) {
          case "1month": return monthsDiff <= 1;
          case "3months": return monthsDiff <= 3;
          case "6months": return monthsDiff <= 6;
          default: return true;
        }
      })();

      // Team size filter
      const matchesTeamSize = teamSize.length === 0 || 
        teamSize.some(size => service.teamSize?.includes(size));

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && 
        matchesFeatures && matchesUseCases && matchesFreeTier && matchesPriceRange && 
        matchesNewness && matchesTeamSize;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'rating-asc':
          return parseFloat(a.rating) - parseFloat(b.rating);
        case 'popularity':
          return b.popularity - a.popularity;
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'price-asc':
        case 'price-desc': {
          const getPrice = (price: string) => {
            if (price === 'Free') return 0;
            if (price === 'Freemium') return 1;
            const match = price.match(/\$(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          const priceA = getPrice(a.price);
          const priceB = getPrice(b.price);
          return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
        }
        default:
          return 0;
      }
    });
  }, [searchQuery, selectedCategory, priceFilters, rating, sortBy, features, useCases, 
    hasFreeTierOnly, priceRange, newness, teamSize]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight" data-testid="text-page-title">
              AI for Business
            </h1>
            <p className="text-xl text-muted-foreground" data-testid="text-page-subtitle">
              Find the perfect solution for your task
            </p>
          </div>

          <div className="flex justify-center">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>

          <div className="flex justify-end">
            <p className="text-sm text-muted-foreground" data-testid="text-service-count">
              2,147 AI services
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="flex-shrink-0">
            <FilterPanel
              category={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceFilters={priceFilters}
              onPriceFilterChange={handlePriceFilterChange}
              rating={rating}
              onRatingChange={setRating}
              features={features}
              onFeaturesChange={setFeatures}
              useCases={useCases}
              onUseCasesChange={setUseCases}
              hasFreeTierOnly={hasFreeTierOnly}
              onHasFreeTierChange={setHasFreeTierOnly}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              newness={newness}
              onNewnessChange={setNewness}
              teamSize={teamSize}
              onTeamSizeChange={setTeamSize}
              quickFilter={quickFilter}
              onQuickFilterChange={handleQuickFilterChange}
              onReset={handleReset}
            />
          </aside>

          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <SortSelect value={sortBy} onChange={setSortBy} />
              <div className="flex items-center gap-2">
                {comparing.size > 0 && (
                  <Button
                    onClick={handleCompare}
                    variant="outline"
                    className="gap-2"
                    data-testid="button-compare-services"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare ({comparing.size})
                  </Button>
                )}
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="gap-2"
                  data-testid="button-export"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedServices.map(service => (
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

            {filteredAndSortedServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found matching your criteria</p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground text-center" data-testid="text-results-count">
                Showing {filteredAndSortedServices.length} out of 2,147 services
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

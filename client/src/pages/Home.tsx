import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ServiceCard from "@/components/ServiceCard";
import SortSelect, { type SortOption } from "@/components/SortSelect";
import { MOCK_SERVICES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Download, GitCompare } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilters, setPriceFilters] = useState({
    free: false,
    freemium: true,
    paid: false,
  });
  const [rating, setRating] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [comparing, setComparing] = useState<Set<string>>(new Set());

  const handlePriceFilterChange = (filter: 'free' | 'freemium' | 'paid') => {
    setPriceFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleReset = () => {
    setCategory("all");
    setPriceFilters({ free: false, freemium: false, paid: false });
    setRating("");
    setSearchQuery("");
    setSortBy("popularity");
  };

  const handleSearch = () => {
    console.log('Search triggered:', searchQuery);
  };

  const handleFavoriteToggle = (serviceId: string, isFavorite: boolean) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isFavorite) {
        newFavorites.add(serviceId);
      } else {
        newFavorites.delete(serviceId);
      }
      return newFavorites;
    });
  };

  const handleCompareToggle = (serviceId: string, isComparing: boolean) => {
    setComparing(prev => {
      const newComparing = new Set(prev);
      if (isComparing) {
        if (newComparing.size >= 4) {
          console.log('Maximum 4 services can be compared');
          return prev;
        }
        newComparing.add(serviceId);
      } else {
        newComparing.delete(serviceId);
      }
      return newComparing;
    });
  };

  const handleExport = () => {
    console.log('Exporting services list...');
    const data = filteredAndSortedServices.map(s => ({
      name: s.name,
      category: s.category,
      price: s.price,
      rating: s.rating,
    }));
    console.log('Export data:', data);
  };

  const handleCompare = () => {
    const servicesToCompare = Array.from(comparing);
    console.log('Comparing services:', servicesToCompare);
  };

  const handleServiceClick = (serviceId: string) => {
    window.location.href = `/service/${serviceId}`;
  };

  const filteredAndSortedServices = useMemo(() => {
    let filtered = MOCK_SERVICES.filter(service => {
      const matchesSearch = searchQuery === "" || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = category === "all" || service.category === category;

      const matchesPrice = 
        (!priceFilters.free && !priceFilters.freemium && !priceFilters.paid) ||
        (priceFilters.free && service.price === "Free") ||
        (priceFilters.freemium && service.price === "Freemium") ||
        (priceFilters.paid && service.price.includes("$"));

      const matchesRating = 
        rating === "" ||
        (rating === "5.0" && parseFloat(service.rating) === 5.0) ||
        (rating === "4.0+" && parseFloat(service.rating) >= 4.0) ||
        (rating === "3.0+" && parseFloat(service.rating) >= 3.0);

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
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
  }, [searchQuery, category, priceFilters, rating, sortBy]);

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
              category={category}
              onCategoryChange={setCategory}
              priceFilters={priceFilters}
              onPriceFilterChange={handlePriceFilterChange}
              rating={rating}
              onRatingChange={setRating}
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

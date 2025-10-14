import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ServiceCard from "@/components/ServiceCard";

//todo: remove mock functionality
const MOCK_SERVICES = [
  {
    id: "1",
    name: "Jasper AI",
    subtitle: "AI Copywriting",
    description: "Content creation for marketing, blogs, and social media",
    category: "copywriting",
    price: "Freemium",
    rating: "4.8",
    icon: "✨",
    color: "#6366f1",
  },
  {
    id: "2",
    name: "Canva AI",
    subtitle: "Design & Visuals",
    description: "Create stunning designs with AI-powered tools",
    category: "design",
    price: "Freemium",
    rating: "4.9",
    icon: "🎨",
    color: "#ec4899",
  },
  {
    id: "3",
    name: "Copy.ai",
    subtitle: "Marketing Texts",
    description: "Generate high-converting marketing copy instantly",
    category: "marketing",
    price: "Freemium",
    rating: "4.7",
    icon: "📝",
    color: "#8b5cf6",
  },
  {
    id: "4",
    name: "Grammarly",
    subtitle: "Text Checking",
    description: "Advanced grammar and writing enhancement",
    category: "text",
    price: "Freemium",
    rating: "4.6",
    icon: "✍️",
    color: "#10b981",
  },
  {
    id: "5",
    name: "ChatGPT Plus",
    subtitle: "Universal AI",
    description: "Advanced AI assistant for any task",
    category: "chat",
    price: "$20/month",
    rating: "4.9",
    icon: "🤖",
    color: "#14b8a6",
  },
  {
    id: "6",
    name: "Buffer AI",
    subtitle: "Social Media",
    description: "Optimize your social media strategy with AI",
    category: "social",
    price: "Freemium",
    rating: "4.5",
    icon: "📱",
    color: "#f59e0b",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilters, setPriceFilters] = useState({
    free: false,
    freemium: true,
    paid: false,
  });
  const [rating, setRating] = useState("");

  const handlePriceFilterChange = (filter: 'free' | 'freemium' | 'paid') => {
    setPriceFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleReset = () => {
    setCategory("all");
    setPriceFilters({ free: false, freemium: false, paid: false });
    setRating("");
    setSearchQuery("");
  };

  const handleSearch = () => {
    console.log('Search triggered:', searchQuery);
  };

  //todo: remove mock functionality
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter(service => {
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
  }, [searchQuery, category, priceFilters, rating]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard
                  key={service.id}
                  name={service.name}
                  subtitle={service.subtitle}
                  description={service.description}
                  price={service.price}
                  rating={service.rating}
                  icon={service.icon}
                  color={service.color}
                />
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No services found matching your criteria</p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <p className="text-sm text-muted-foreground text-center" data-testid="text-results-count">
                Showing {filteredServices.length} out of 2,147 services
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

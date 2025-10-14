import { useState } from "react";
import FilterPanel from "../FilterPanel";

export default function FilterPanelExample() {
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
  };

  return (
    <FilterPanel
      category={category}
      onCategoryChange={setCategory}
      priceFilters={priceFilters}
      onPriceFilterChange={handlePriceFilterChange}
      rating={rating}
      onRatingChange={setRating}
      onReset={handleReset}
    />
  );
}

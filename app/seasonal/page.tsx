"use client";

import { useState } from "react";
import SeasonSelector from "@/components/SeasonSelector";
import type { Season } from "@/components/SeasonSelector";
import ProductCard from "@/components/product/ProductCard";
import { allProducts } from "@/lib/mockData";

const seasonLabels: Record<Season, string> = {
  rainy: "Rainy",
  summer: "Summer",
  winter: "Winter",
};

export default function SeasonalPage() {
  const [selectedSeason, setSelectedSeason] = useState<Season>("summer");

  const filtered = allProducts.filter(
    (p) => p.category.toLowerCase() === selectedSeason
  );

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-text text-center mb-4">
          Seasonal Collections
        </h1>
        <p className="text-sm text-text/60 text-center mb-10 max-w-lg mx-auto">
          Browse products curated for every season. Rainy, summer, or winter&mdash;find
          what you need.
        </p>

        <div className="flex justify-center mb-12">
          <SeasonSelector
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />
        </div>

        <h2 className="text-xl font-semibold text-text mb-6">
          {seasonLabels[selectedSeason]} Collection
          <span className="text-text/50 text-sm ml-2">({filtered.length} products)</span>
        </h2>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            ))}
          </div>
        ) : (
          <p className="text-text/50 text-center py-16">No products found for this season.</p>
        )}
      </div>
    </section>
  );
}
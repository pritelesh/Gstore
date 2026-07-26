"use client";

import { Search, Filter, X } from "lucide-react";

interface ShopFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

export default function ShopFilters({
  categories,
  selectedCategories,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  mobileOpen,
  onMobileToggle,
}: ShopFiltersProps) {
  return (
    <>
      <button
        onClick={onMobileToggle}
        className="lg:hidden neu-flat p-3 flex items-center gap-2 text-sm font-medium text-text mb-4"
      >
        <Filter size={18} />
        Filters & Sort
      </button>

      <div
        className={`${mobileOpen ? "fixed inset-0 z-50 flex" : "hidden"} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-full`}
      >
        <div
          className={`${mobileOpen ? "fixed inset-0 bg-black/50" : "hidden"} lg:hidden`}
          onClick={onMobileToggle}
        />

        <div className={`${mobileOpen ? "relative w-80 max-w-full h-full overflow-y-auto" : ""} lg:w-full`}>
          <div className="neu-flat p-5 h-full lg:h-auto">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="text-sm font-bold text-text">Filters</h3>
              <button
                onClick={onMobileToggle}
                className="text-text/50 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-5">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full neu-pressed bg-surface text-text text-sm rounded-xl pl-9 pr-3 py-2.5 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-text/70 mb-2 block">Sort By</label>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full neu-pressed bg-surface text-text text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="text-xs font-semibold text-text/70 mb-2 block">Price Range (৳)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                  placeholder="Min"
                  className="w-full neu-pressed bg-surface text-text text-sm rounded-xl px-3 py-2 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-text/30 text-xs">—</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => onMaxPriceChange(e.target.value)}
                  placeholder="Max"
                  className="w-full neu-pressed bg-surface text-text text-sm rounded-xl px-3 py-2 placeholder-text/40 focus:outline-none focus:ring-2 focus:ring-accent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text/70 mb-2 block">Category</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => onCategoryChange(cat)}
                      className="w-4 h-4 rounded border-text/20 bg-surface text-accent focus:ring-accent focus:ring-2 cursor-pointer"
                    />
                    <span className="text-sm text-text/70 group-hover:text-text transition-colors">
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

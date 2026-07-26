"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/actions/products";
import type { ProductListItem, CategoryInfo } from "@/lib/actions/products";

export default function ShopPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then((cats: CategoryInfo[]) =>
        setCategories(
          cats
            .filter((c) => c.type === "normal")
            .map((c) => c.name),
        ),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({
      search: search || undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort !== "newest" ? sort : undefined,
      page,
      limit: 9,
    })
      .then((result) => {
        setProducts(result.products);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, selectedCategories, minPrice, maxPrice, sort, page]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat],
    );
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-text mb-8">
          All Products
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <ShopFilters
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={(v) => { setMinPrice(v); setPage(1); }}
              onMaxPriceChange={(v) => { setMaxPrice(v); setPage(1); }}
              sort={sort}
              onSortChange={(v) => { setSort(v); setPage(1); }}
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              mobileOpen={mobileFilterOpen}
              onMobileToggle={() => setMobileFilterOpen(!mobileFilterOpen)}
            />
          </div>

          <div className="lg:w-3/4">
            <p className="text-sm text-text/50 mb-6">
              {loading ? "Loading…" : `${total} product${total !== 1 ? "s" : ""} found`}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="neu-flat p-4 animate-pulse">
                    <div className="w-full aspect-[4/3] rounded-xl bg-text/5" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-text/5" />
                    <div className="mt-2 h-4 w-1/3 rounded bg-text/5" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="neu-flat p-10 text-center">
                <p className="text-sm text-text/60">No products match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="neu-flat p-2.5 text-text disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`neu-flat w-10 h-10 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                        p === page
                          ? "bg-accent text-white"
                          : "text-text hover:brightness-110"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="neu-flat p-2.5 text-text disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/actions/products";
import type { ProductListItem } from "@/lib/actions/products";

export default function ProductGrid() {
  const [products, setProducts] = useState<ProductListItem[]>([]);

  useEffect(() => {
    getProducts({ limit: 6 }).then((r) => setProducts(r.products)).catch(() => {});
  }, []);

  return (
    <section className="py-16 md:py-24 bg-surface/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-text text-center mb-10">
          Shop Our Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
}

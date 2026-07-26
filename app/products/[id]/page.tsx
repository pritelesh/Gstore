"use client";

import { useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductById, getProducts } from "@/lib/actions/products";
import type { ProductDetail, ProductListItem } from "@/lib/actions/products";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<ProductDetail | null | undefined>(
    undefined,
  );
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    getProductById(id).then((p) => {
      if (!p) {
        setProduct(null);
        return;
      }
      setProduct(p);
      getProducts({ category: [p.category], limit: 5 }).then((res) => {
        setRelated(res.products.filter((r) => r.id !== id).slice(0, 4));
      });
    });
  }, [id]);

  if (product === null) notFound();
  if (product === undefined)
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="neu-flat p-12 max-w-md mx-auto animate-pulse">
            <div className="w-full aspect-square rounded-xl bg-text/5 mb-4" />
            <div className="h-6 w-2/3 mx-auto rounded bg-text/5" />
          </div>
        </div>
      </section>
    );

  const inStock = product.stock > 0;

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/products"
            className="text-sm text-text/50 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg transition-colors"
          >
            &larr; Back to Shop
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-1/2">
            <div className="neu-flat p-3">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`neu-flat w-16 h-16 p-1 rounded-xl overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                      i === selectedImage ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2">
            <div className="neu-flat p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-text">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-accent mt-3">
                ৳{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-text/60 mt-4 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-3 mt-5">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-lg ${
                    inStock
                      ? "text-green-400 bg-green-400/10"
                      : "text-red-400 bg-red-400/10"
                  }`}
                >
                  {inStock ? `In Stock (${product.stock})` : "Out of Stock"}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <span className="text-sm text-text/70">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-text">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="neu-flat p-2 text-text hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-xl transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] }, quantity);
                  }}
                  className="flex-1 px-6 py-3 bg-accent text-white font-semibold rounded-2xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] }, quantity);
                    router.push("/checkout");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-accent text-accent font-semibold rounded-2xl hover:bg-accent hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="neu-flat p-6 mt-10">
          <h2 className="text-lg font-bold text-text mb-4">Product Details</h2>
          <p className="text-sm text-text/70 leading-relaxed">
            {product.fullDescription}
          </p>
          <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/5">
            <div>
              <span className="text-xs text-text/40">Category</span>
              <p className="text-sm font-medium text-text">{product.category}</p>
            </div>
            <div>
              <span className="text-xs text-text/40">Sold by</span>
              <p className="text-sm font-medium text-text">{product.storeName}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-text mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/products/${rp.id}`}
                  className="neu-flat p-4 group transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={rp.image}
                      alt={rp.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-text">
                      {rp.name}
                    </h3>
                    <p className="text-xs text-accent font-bold mt-1">
                      ৳{rp.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

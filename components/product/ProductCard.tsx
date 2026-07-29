"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
}

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="neu-flat p-4 flex flex-col">
      <Link
        href={`/products/${id}`}
        className="group focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
      >
        <div className="relative w-full h-[250px] rounded-xl overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        </div>
        <div className="mt-4 mb-3">
          <h3 className="text-xl font-semibold text-text">{name}</h3>
          <p className="text-sm text-accent font-bold mt-1">
            ৳{price.toLocaleString()}
          </p>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          addItem({ id, name, price, image });
        }}
        className="mt-auto w-full neu-pressed bg-surface text-text text-sm font-medium py-2.5 rounded-xl hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Add to Cart
      </button>
    </div>
  );
}

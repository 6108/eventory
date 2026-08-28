// src/component/pos/ProductGrid.tsx
"use client";


import { PosProduct } from "@/src/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: PosProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 6}
        />
      ))}
    </div>
  );
}
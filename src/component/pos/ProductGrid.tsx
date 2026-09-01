// src/component/pos/ProductGrid.tsx
"use client";


import { PosProduct } from "@/src/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: PosProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
"use client";

import { useState } from "react";
import ProductList from "@/src/component/booth/ProductList";
import { mockProducts } from "@/src/mocks/products";
import { Product } from "@/src/types/product";

const categories = [
  { value: "ALL", label: "전체" },
  { value: "ACRYLIC", label: "아크릴" },
  { value: "STICKER", label: "스티커" },
  { value: "PAPER", label: "인쇄물" },
  { value: "BOOK", label: "책" },
  { value: "ETC", label: "기타" },
];

export default function Page() {
  const [category, setCategory] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");

  const filteredProducts = mockProducts.filter((product) => {
    const categoryMatch =
      category === "ALL" || product.category === category;

    const typeMatch =
      type === "ALL" || product.type === type;

    return categoryMatch && typeMatch;
  });

  const types = category === "ALL"
    ? []
    : Array.from(
      new Set(
        mockProducts
          .filter((product) => product.category === category)
          .map((product) => product.type)
      )
    );

  return (
    <div className="flex flex-col gap-6">
      {/* 카테고리 */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((item) => (
          <button
            key={item.value}
            onClick={() => {
              setCategory(item.value);
              setType("ALL");
            }}
            className={`rounded-full px-4 py-2 text-sm ${category === item.value
                ? "bg-primary text-white"
                : "bg-zinc-200"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 타입 */}
      {types.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setType("ALL")}
            className={`rounded-full px-3 py-1 text-sm ${type === "ALL"
                ? "bg-primary text-white"
                : "bg-zinc-200"
              }`}
          >
            전체
          </button>

          {types.map((item) => (
            <button
              key={item}
              onClick={() => setType(item)}
              className={`rounded-full px-3 py-1 text-sm ${type === item
                  ? "bg-primary text-white"
                  : "bg-zinc-200"
                }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* 상품 */}
      <ProductList products={filteredProducts} />
    </div>
  );
}
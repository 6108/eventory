"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export default function Like() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLiked(!liked);
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      className="absolute top-1 right-1 z-10 flex h-8 w-8 items-center justify-center 
      rounded-full bg-zinc-300/70 text-primary hover:bg-zinc-200 transition-colors"
    >
      <Heart
        size={20}
        className={liked ? "fill-primary" : ""}
      />
    </button>
  );
}
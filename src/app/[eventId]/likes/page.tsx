// src/app/likes/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { getLikedProducts } from "@/src/lib/data/productLike";
import { LikesTabs } from "@/src/component/likes/LikesTabs";
import { getFollowedBooths } from "@/src/lib/data/booth";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [likedProducts, followedBooths] = await Promise.all([
    getLikedProducts(user.id),
    getFollowedBooths(user.id),
  ]);

  return (
    <LikesTabs likedProducts={likedProducts} followedBooths={followedBooths} />
  );
}
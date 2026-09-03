import FollowedBoothList from "@/src/component/likes/FollowedBoothList";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { getFollowedBooths } from "@/src/lib/data/booth";


export default async function page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [followedBooths] = await Promise.all([
    getFollowedBooths(user.id),
  ]);

  return (
    <FollowedBoothList followedBooths={followedBooths} />

  )
}

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import MyOrdersView from "@/src/component/orders/MyOrdersView";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <MyOrdersView />;
}

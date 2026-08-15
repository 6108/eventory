import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import ProfileForm from "@/src/component/form/ProfileForm";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, email, name, profile_image, created_at")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-zinc-400">
          사용자 정보를 불러오지 못했습니다.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          마이페이지
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          내 계정 정보를 관리할 수 있습니다.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-5 text-lg font-semibold text-white">
          프로필
        </h2>

        <div className="mb-6 flex items-center gap-4">
          {profile.profile_image ? (
            <img
              src={profile.profile_image}
              alt={profile.name ?? "프로필"}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl text-zinc-400">
              {profile.name?.charAt(0) ?? "?"}
            </div>
          )}

          <div className="min-w-0">
            <p className="font-medium text-white">
              {profile.name || "이름 없음"}
            </p>
            <p className="break-all text-sm text-zinc-400">
              {profile.email}
            </p>
          </div>
        </div>

        <ProfileForm name={profile.name ?? ""} />
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          계정 정보
        </h2>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-400">이메일</span>
            <span className="break-all text-white">
              {profile.email}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-zinc-400">가입일</span>
            <span className="text-white">
              {new Date(profile.created_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
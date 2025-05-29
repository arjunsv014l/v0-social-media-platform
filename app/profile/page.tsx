import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import ProfileView from "@/components/profile-view"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { count: friendsCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "accepted")

  const { count: postsCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <SidebarInset>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Profile 👤
            </h1>
          </div>
        </header>

        <ProfileView
          profile={profile}
          posts={posts || []}
          isOwnProfile={true}
          stats={{
            friends: friendsCount || 0,
            posts: postsCount || 0,
          }}
        />
      </div>
    </SidebarInset>
  )
}

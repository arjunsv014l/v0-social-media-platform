import FriendsView from "@/components/friends-view"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function FriendsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch accepted friends for the current user
  // We need to fetch profiles of users who are friends with the current user.
  // This means looking for friendships where user.id is either user_id or friend_id, and status is 'accepted',
  // then fetching the profile of the *other* person in that relationship.

  const { data: friendRelations, error: friendRelationsError } = await supabase
    .from("friendships")
    .select(
      `
      user_id,
      friend_id,
      user:profiles!user_id(*),
      friend:profiles!friend_id(*)
    `,
    )
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq("status", "accepted")

  if (friendRelationsError) {
    console.error("Error fetching friend relations:", friendRelationsError)
  }

  const friends =
    friendRelations
      ?.map((relation) => {
        if (relation.user_id === user.id) return relation.friend
        if (relation.friend_id === user.id) return relation.user
        return null
      })
      .filter((profile) => profile !== null) || []

  // Fetch pending friend requests received by the current user
  const { data: requestsData, error: requestsError } = await supabase
    .from("friendships")
    .select(
      `
      id,
      created_at,
      user:profiles!user_id(*)
    `,
    )
    .eq("friend_id", user.id)
    .eq("status", "pending")

  if (requestsError) {
    console.error("Error fetching friend requests:", requestsError)
  }
  const requests = requestsData || []

  // Fetch suggested friends (users not yet connected and not the current user)
  // This is a simplified suggestion logic. A real app would have more complex suggestions.
  const { data: allUsers, error: allUsersError } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, major, graduation_year")
    .neq("id", user.id) // Exclude current user
    .limit(10)

  if (allUsersError) {
    console.error("Error fetching all users for suggestions:", allUsersError)
  }

  // Filter out users who are already friends or have pending requests
  const friendIds = new Set(friends.map((f: any) => f.id))
  const requestSenderIds = new Set(requests.map((r: any) => r.user.id))

  const suggestions =
    allUsers?.filter((u) => !friendIds.has(u.id) && !requestSenderIds.has(u.id) && u.id !== user.id) || []

  return <FriendsView friends={friends} requests={requests} suggestions={suggestions} />
}

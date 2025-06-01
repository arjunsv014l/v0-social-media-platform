import { createServerComponentClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

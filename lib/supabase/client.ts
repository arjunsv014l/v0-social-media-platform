import { createClientComponentClient } from "@supabase/ssr"
import type { Database } from "./types"

export const supabase = createClientComponentClient<Database>()

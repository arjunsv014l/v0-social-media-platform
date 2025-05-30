"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreatePostArgs {
  title: string
  content: string
  authorId: string
  // Add any other fields relevant to your 'posts' table, e.g., user_type
}

export async function createPost(data: CreatePostArgs) {
  const supabase = await createServerSupabaseClient()

  const { title, content, authorId } = data

  if (!authorId) {
    return { error: "User not authenticated." }
  }

  if (!title || !content) {
    return { error: "Title and content are required." }
  }

  try {
    const { data: postData, error } = await supabase
      .from("posts")
      .insert([
        {
          user_id: authorId,
          title: title,
          content: content,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating post:", error.message)
      return { error: `Database error: ${error.message}` }
    }

    revalidatePath("/")
    return { data: postData, error: null }
  } catch (e: any) {
    console.error("Unexpected error creating post:", e.message)
    return { error: `An unexpected error occurred: ${e.message}` }
  }
}

// You can add other server actions here as your application grows.

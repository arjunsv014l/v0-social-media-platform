export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          major: string | null
          graduation_year: number | null
          university: string | null
          created_at: string
          updated_at: string
          is_profile_complete: boolean
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          major?: string | null
          graduation_year?: number | null
          university?: string | null
          created_at?: string
          updated_at?: string
          is_profile_complete?: boolean
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          major?: string | null
          graduation_year?: number | null
          university?: string | null
          created_at?: string
          updated_at?: string
          is_profile_complete?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          shares_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: "pending" | "accepted" | "rejected"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: "pending" | "accepted" | "rejected"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: "pending" | "accepted" | "rejected"
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          time: string
          location: string
          category: string
          image_url: string | null
          creator_id: string
          attendees_count: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          time: string
          location: string
          category: string
          image_url?: string | null
          creator_id: string
          attendees_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          location?: string
          category?: string
          image_url?: string | null
          creator_id?: string
          attendees_count?: number
          created_at?: string
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          name: string
          professor: string
          credits: number
          schedule: string
          location: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          professor: string
          credits: number
          schedule: string
          location: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          professor?: string
          credits?: number
          schedule?: string
          location?: string
          created_at?: string
        }
      }
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          user_id: string
          grade: string | null
          progress: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          grade?: string | null
          progress?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          grade?: string | null
          progress?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      content: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          content_type: string
          file_url: string
          thumbnail_url: string | null
          duration: number | null
          file_size: number | null
          tags: string[] | null
          is_public: boolean
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          content_type: string
          file_url: string
          thumbnail_url?: string | null
          duration?: number | null
          file_size?: number | null
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          content_type?: string
          file_url?: string
          thumbnail_url?: string | null
          duration?: number | null
          file_size?: number | null
          tags?: string[] | null
          is_public?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface PostWithAuthor {
  id: string
  user_id: string
  content: string
  image_url?: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  author: Profile | null
}

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string | null
  bio?: string | null
  major?: string | null
  graduation_year?: number | null
  university?: string | null
  created_at: string
  updated_at: string
  is_profile_complete: boolean
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  image_url?: string | null
  creator_id: string
  attendees_count: number
  created_at: string
}

export interface Content {
  id: string
  user_id: string
  title: string
  description?: string | null
  content_type: string
  file_url: string
  thumbnail_url?: string | null
  duration?: number | null
  file_size?: number | null
  tags?: string[] | null
  is_public: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string // Corresponds to auth.users.id
  updated_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  website?: string
  user_type?: "student" | "professional" | "corporate" | "university" // Added 'university'
  // is_profile_complete is removed as per requirements

  // Student specific
  college?: "SIMATS" | "VIT" | "SRM" | string // Made specific, but allow string for flexibility
  year_of_study?: string // e.g., "1st year", "2nd year", "Final year"
  degree?: string // e.g., "B.Tech CSE", "MBA"
  role?: string // Composite role, e.g., "SIMATS 4th year B.Tech CSE"
  student_id_number?: string

  // Professional specific
  job_title?: string
  company?: string // Company professional works for
  industry?: string
  years_experience?: string
  linkedin_url?: string
  skills?: string[]
  bio?: string

  // Corporate specific (for the company the user represents)
  company_name?: string
  company_size?: string
  // industry is shared
  company_website?: string
  headquarters?: string
  company_description?: string
  founded_year?: string // Changed from integer to string for flexibility in forms

  // University specific
  affiliated_college?: "SIMATS" | "VIT" | "SRM" | string // College the university user is associated with
  // job_title can be used for university staff title
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  created_at: string
  updated_at?: string
  likes_count?: number
  comments_count?: number
}

export interface PostWithAuthor extends Post {
  author: Profile
}

export interface Course {
  id: string
  code: string
  name: string
  professor?: string
  credits?: number
  schedule?: string
  location?: string
  college_name: "SIMATS" | "VIT" | "SRM" | string // Matches DB
  description?: string
  created_at?: string
  updated_at?: string
}

// Add other types as needed (e.g., Event, Message, Notification)

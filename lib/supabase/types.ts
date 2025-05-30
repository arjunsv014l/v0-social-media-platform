// ... other types ...

export interface Profile {
  id: string // UUID from auth.users
  updated_at?: string
  created_at?: string // Often managed by Supabase default value
  username?: string
  full_name?: string
  avatar_url?: string
  // website?: string // This line is now removed
  user_type?: "student" | "professional" | "corporate" | "university"
  is_profile_complete?: boolean // Should be BOOLEAN in DB

  // Student specific (can be null for other types)
  university?: string
  major?: string
  graduation_year?: string
  student_id_number?: string // Should be TEXT or VARCHAR in DB
  contact_phone?: string // Should be TEXT or VARCHAR in DB

  // Professional specific
  company?: string
  job_title?: string
  industry?: string
  linkedin_profile?: string

  // Corporate/University specific
  organization_name?: string
  organization_type?: "corporate" | "university"
  contact_email?: string
  // Add other relevant fields for corporate/university users
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  created_at: string
  // ... other post fields
}

// ... other types ...

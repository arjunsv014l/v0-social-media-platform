export interface Profile {
  id: string // Corresponds to auth.users.id
  updated_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  website?: string
  user_type?: "student" | "professional" | "corporate"
  is_profile_complete?: boolean // Essential for redirection logic

  // Student specific
  university?: string
  major?: string
  graduation_year?: string // Ensure consistent naming (e.g., snake_case for DB)
  student_id_number?: string
  contact_phone?: string // New field for student contact

  // Professional specific
  job_title?: string // Can also be for corporate user's own title
  company?: string // Company professional works for
  industry?: string // Also for corporate company
  years_experience?: string // Or number
  linkedin_url?: string // Professional's or Corporate user's LinkedIn
  skills?: string[] // Stored as text[] in Supabase
  bio?: string

  // Corporate specific (for the company the user represents)
  company_name?: string // Name of the company being represented
  company_size?: string
  // industry is shared with professional, but context is company's industry
  company_website?: string
  headquarters?: string // Company's HQ
  // linkedin_url (can be company's LinkedIn page)
  // job_title (user's title within this company)
  company_description?: string
  founded_year?: string
}

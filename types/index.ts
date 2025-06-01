export interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  user_type: "student" | "university" | "corporate"
  bio?: string
  website?: string
  location?: string
  role_description?: string
  college_name?: string
  year_of_study?: number
  degree?: string
  company?: string
  position?: string
  industry?: string
  company_size?: string
  experience_years?: number
  updated_at?: string
  created_at?: string
  is_profile_complete?: boolean
}

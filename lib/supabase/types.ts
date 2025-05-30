// ... other types ...

export interface Profile {
  id: string // UUID from auth.users
  updated_at?: string
  created_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  // website?: string // This line is now removed
  user_type?: "student" | "professional" | "corporate" | "university"
  is_profile_complete?: boolean

  // Student specific (can be null for other types)
  university?: string
  major?: string
  graduation_year?: string
  student_id_number?: string
  contact_phone?: string

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

// ... other types ...

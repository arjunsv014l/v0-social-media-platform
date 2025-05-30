export interface Profile {
  id: string // Corresponds to auth.users.id
  updated_at?: string
  username?: string // Should be unique
  full_name?: string
  avatar_url?: string
  user_type: "student" | "university" | "corporate" // Strictly these three

  // Common fields (optional based on role)
  email?: string // Copied from auth.users for convenience if needed

  // Student specific
  college_name?: "SIMATS" | "VIT" | "SRM" // Enforce specific colleges
  year_of_study?: "1st" | "2nd" | "3rd" | "4th" | "5th" // Or number
  degree?: string // e.g., "B.Tech CSE", "MBA"
  student_id_number?: string
  role_description?: string // Generated: e.g., "SIMATS 4th year B.Tech CSE"

  // University specific (for university admin/staff)
  // college_name is also used here to scope their access
  job_title?: string // e.g., "Dean of Academics", "Admissions Officer"

  // Corporate specific
  company_name?: string
  company_website?: string
  // job_title can also be used here for the corporate user's title
  industry?: string
  company_description?: string

  // Fields to consider removing if not used by new design:
  // website?: string; // If generic website isn't needed for all
  // skills?: string[];
  // bio?: string;
  // company?: string; // If corporate user's company is company_name
  // company_size?: string;
  // headquarters?: string;
  // founded_year?: string;
  // linkedin_url?: string;
  // years_experience?: string;
  // graduation_year?: string; // For student, year_of_study is more direct
}

// Interface for a Post, ensuring it can be linked to a college
export interface Post {
  id: string
  user_id: string // Author's ID
  title: string
  content: string
  created_at: string
  college_name?: "SIMATS" | "VIT" | "SRM" // To scope posts to a college
  // any other post fields
}

export interface PostWithAuthor {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  college_name?: "SIMATS" | "VIT" | "SRM"
  author: Profile | null // Author's profile
}

// Interface for a Course, ensuring it's linked to a college
export interface Course {
  id: string
  course_code: string
  course_name: string
  professor_name?: string // Or link to a professor profile
  credits: number
  college_name: "SIMATS" | "VIT" | "SRM" // Mandatory for courses
  // any other course fields
}

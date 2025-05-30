"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  authChecked: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup"]
const profileCompletionPath = "/profile/complete"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log("AuthContext: Fetching profile for user ID:", userId)
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error && error.code !== "PGRST116") {
        console.error("AuthContext: Error fetching profile:", error)
        return null
      }
      console.log("AuthContext: Profile data fetched:", profileData)
      return profileData as Profile | null
    } catch (error) {
      console.error("AuthContext: Exception in fetchProfile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log("AuthContext: Refreshing profile for user:", user.id)
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
    }
  }, [user?.id, fetchProfile])

  const getDashboardPath = useCallback((userType?: Profile["user_type"]) => {
    switch (userType) {
      case "student":
        return "/" // Student dashboard is the main feed
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      case "university":
        return "/university/dashboard" // Assuming a university dashboard path
      default:
        console.warn("AuthContext: Unknown user type for dashboard path:", userType)
        return "/"
    }
  }, [])

  useEffect(() => {
    console.log("AuthContext: Initializing auth state listener.")
    setLoading(true)
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) console.error("AuthContext: Error getting session:", sessionError)
        const activeUser = session?.user ?? null
        setUser(activeUser)
        console.log("AuthContext: Initial session user:", activeUser?.id)
        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("AuthContext: Error in initial fetchUserAndProfile:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
        console.log("AuthContext: Initial auth check complete. AuthChecked:", true, "Loading:", false)
      }
    }
    fetchUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed. Event:", event, "Session User:", session?.user?.id)
      setLoading(true)
      const activeUser = session?.user ?? null
      setUser(activeUser)
      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
      setAuthChecked(true)
      console.log("AuthContext: Auth state change processed. Loading:", false)
    })
    return () => {
      console.log("AuthContext: Unsubscribing auth listener.")
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  useEffect(() => {
    if (loading || !authChecked) {
      console.log("AuthContext: Redirect check skipped - loading or auth not checked.", { loading, authChecked })
      return
    }
    const isAuthPage = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    console.log("AuthContext: Evaluating redirection...", {
      pathname,
      user: !!user,
      profile: !!profile,
      userType: profile?.user_type,
      isProfileComplete: profile?.is_profile_complete,
      isAuthPage,
      isProfileCompletePage,
    })

    if (user) {
      if (profile) {
        if (profile.is_profile_complete === false) {
          // Explicitly check for false
          if (!isProfileCompletePage) {
            console.log("AuthContext: User logged in, profile incomplete. Redirecting to:", profileCompletionPath)
            router.push(profileCompletionPath)
          } else {
            console.log("AuthContext: User on profile completion page.")
          }
        } else if (profile.is_profile_complete === true) {
          // Explicitly check for true
          const dashboardPath = getDashboardPath(profile.user_type)
          if (isAuthPage || isProfileCompletePage) {
            console.log(
              "AuthContext: User logged in, profile complete. On auth/complete page. Redirecting to dashboard:",
              dashboardPath,
            )
            router.push(dashboardPath)
          } else {
            // Optional: Redirect if on the wrong dashboard type
            const currentBase = pathname.split("/")[1] || ""
            const targetBase = dashboardPath.split("/")[1] || ""
            if (targetBase && currentBase !== targetBase && dashboardPath !== "/" && !pathname.startsWith("/api")) {
              console.log(`AuthContext: User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
              router.push(dashboardPath)
            } else {
              console.log("AuthContext: User logged in, profile complete. On a valid page or their dashboard.")
            }
          }
        } else {
          // is_profile_complete is null or undefined, treat as incomplete or wait for profile to fully load
          console.log("AuthContext: Profile's is_profile_complete status is unclear. Assuming incomplete or waiting.")
          if (!isProfileCompletePage && !isAuthPage) {
            // Avoid redirect loops if already on complete/auth page
            router.push(profileCompletionPath)
          }
        }
      } else {
        console.log("AuthContext: User logged in, but profile is null. Waiting for profile.")
        // Potentially redirect to /profile/complete if profile remains null after a timeout,
        // or if it's a new user (though signup should create a basic profile).
      }
    } else {
      // No user (logged out)
      if (!isAuthPage && !isProfileCompletePage) {
        console.log("AuthContext: No user. Not on public page. Redirecting to /login")
        router.push("/login")
      } else {
        console.log("AuthContext: No user. On a public page.")
      }
    }
  }, [user, profile, loading, authChecked, pathname, router, getDashboardPath])

  const signIn = async (email: string, password: string) => {
    console.log("AuthContext: Attempting sign in for:", email)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error("AuthContext: Sign in error:", error)
        throw error
      }
      console.log("AuthContext: Sign in successful via Supabase. Waiting for onAuthStateChange.")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("AuthContext: Attempting sign up for:", email, "User Data:", userData)
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: `${userData.firstName} ${userData.lastName}`, user_type: userData.userType } },
      })
      if (authError) {
        console.error("AuthContext: Supabase auth.signUp error:", authError)
        throw authError
      }
      if (!authData.user) {
        console.error("AuthContext: Supabase auth.signUp did not return a user.")
        throw new Error("Sign up failed, user not created.")
      }
      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        // email: authData.user.email, // email is already in auth.users, not typically duplicated in profiles
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7),
        user_type: userData.userType,
        is_profile_complete: false, // CRUCIAL: New profiles are incomplete
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }
      if (userData.userType === "student") {
        profileToInsert.university = userData.university
        profileToInsert.major = userData.major
        profileToInsert.graduation_year = userData.graduationYear
        profileToInsert.student_id_number = userData.studentId
      } else if (userData.userType === "professional") {
        profileToInsert.job_title = userData.jobTitle
        profileToInsert.company = userData.company
        profileToInsert.industry = userData.industry
      } else if (userData.userType === "corporate") {
        profileToInsert.organization_name = userData.companyName // Assuming companyName maps to organization_name
        profileToInsert.contact_email = userData.companyEmail // Assuming companyEmail maps to contact_email
        profileToInsert.organization_type = "corporate"
      } else if (userData.userType === "university") {
        profileToInsert.organization_name = userData.universityName // Assuming universityName maps to organization_name
        profileToInsert.contact_email = userData.universityEmail // Assuming universityEmail maps to contact_email
        profileToInsert.organization_type = "university"
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile)
      if (profileError) {
        console.error("AuthContext: Error inserting profile data:", profileError)
        throw profileError
      }
      console.log("AuthContext: Sign up and initial profile creation successful. User ID:", authData.user.id)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log("AuthContext: Attempting Supabase sign out.")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("AuthContext: Supabase sign out error:", error)
        throw error
      }
      console.log(
        "AuthContext: Supabase sign out command successful. Waiting for onAuthStateChange to clear state and trigger redirection.",
      )
    } catch (error) {
      console.error("AuthContext: Error during signOut initiation:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  console.log("AuthContext Provider rendering. State:", {
    user: user?.id,
    profileLoaded: !!profile,
    userType: profile?.user_type,
    isProfileComplete: profile?.is_profile_complete,
    loading,
    authChecked,
    pathname,
  })

  return (
    <AuthContext.Provider value={{ user, profile, loading, authChecked, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

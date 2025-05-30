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
  signUp: (email: string, password: string, userData: any, userType: Profile["user_type"]) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup"]
// const profileCompletionPath = "/profile/complete" // Removed

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
      return updatedProfile
    }
    return null
  }, [user?.id, fetchProfile])

  const getDashboardPath = useCallback((userType?: Profile["user_type"], profileData?: Profile | null) => {
    switch (userType) {
      case "student":
        return "/" // Student main feed
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      case "university":
        // Could be /university/dashboard or /university/[college_name]/dashboard
        // For now, a generic one, specific data loading will handle college.
        return "/university/dashboard"
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

    console.log("AuthContext: Evaluating redirection...", {
      pathname,
      user: !!user,
      profile: !!profile,
      userType: profile?.user_type,
      isAuthPage,
    })

    if (user && profile) {
      // User is logged in AND profile is loaded
      const dashboardPath = getDashboardPath(profile.user_type, profile)
      if (isAuthPage) {
        console.log(
          "AuthContext: User logged in, profile loaded. On auth page. Redirecting to dashboard:",
          dashboardPath,
        )
        router.push(dashboardPath)
      } else {
        // Optional: Redirect if on the wrong dashboard type, more complex logic might be needed for sub-paths
        const currentBase = pathname.split("/")[1]
        const targetBase = dashboardPath.split("/")[1]
        if (targetBase && currentBase !== targetBase && !pathname.startsWith("/api") && dashboardPath !== "/") {
          // Avoid redirecting from "/" if it's a valid dashboard (e.g. student)
          console.log(`AuthContext: User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
          router.push(dashboardPath)
        } else {
          console.log("AuthContext: User logged in, profile loaded. On a valid page or their dashboard:", dashboardPath)
        }
      }
    } else if (user && !profile && !loading) {
      // User logged in, but profile fetch failed or is pending (should be rare after initial load)
      // This state implies an issue with profile creation or fetching post-login.
      // Since profile completion is removed, if a profile doesn't exist, it's an error state or new signup.
      // For new signups, the profile is created server-side by a trigger.
      // If stuck here, it might mean the trigger failed or profile data is missing.
      // We won't redirect to a completion page. If on auth page, stay. Otherwise, could go to login or show error.
      console.warn(
        "AuthContext: User logged in, but profile is null/missing after loading. This might indicate an issue.",
      )
      if (!isAuthPage) {
        // Potentially redirect to login if profile is consistently missing, indicating an issue.
        // router.push("/login"); // This could be too aggressive.
      }
    } else if (!user) {
      // No user (logged out)
      if (!isAuthPage) {
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
      // onAuthStateChange will handle setting user and profile, then redirection effect will run
      console.log("AuthContext: Sign in successful via Supabase. Waiting for onAuthStateChange.")
    } catch (error) {
      setLoading(false) // Ensure loading is false on catch
      throw error
    }
    // setLoading(false) will be handled by onAuthStateChange or its finally block
  }

  const signUp = async (email: string, password: string, userData: any, userType: Profile["user_type"]) => {
    console.log("AuthContext: Attempting sign up for:", email, "User Type:", userType, "User Data:", userData)
    setLoading(true)

    // Construct role for students
    let role = userData.role // For non-students or if already constructed
    if (userType === "student" && userData.college && userData.year_of_study && userData.degree) {
      role = `${userData.college} ${userData.year_of_study} ${userData.degree}`
    }

    const profileDataToInsert = {
      full_name: `${userData.firstName} ${userData.lastName}`,
      username: email.split("@")[0] + Math.random().toString(36).substring(2, 7), // More unique username
      user_type: userType,
      avatar_url: userData.avatar_url || null,
      // Student specific
      college: userType === "student" ? userData.college : null,
      year_of_study: userType === "student" ? userData.year_of_study : null,
      degree: userType === "student" ? userData.degree : null,
      role: role, // Assign constructed or passed role
      student_id_number: userType === "student" ? userData.studentId : null,
      // Professional specific
      job_title: userType === "professional" ? userData.jobTitle : userType === "university" ? userData.jobTitle : null,
      company: userType === "professional" ? userData.company : null,
      industry: userType === "professional" || userType === "corporate" ? userData.industry : null,
      years_experience: userType === "professional" ? userData.yearsExperience : null,
      linkedin_url: userType === "professional" ? userData.linkedinUrl : null,
      skills: userType === "professional" ? userData.skills : null,
      bio: userType === "professional" ? userData.bio : null,
      // Corporate specific
      company_name: userType === "corporate" ? userData.companyName : null,
      company_size: userType === "corporate" ? userData.companySize : null,
      company_website: userType === "corporate" ? userData.companyWebsite : null,
      headquarters: userType === "corporate" ? userData.headquarters : null,
      company_description: userType === "corporate" ? userData.companyDescription : null,
      founded_year: userType === "corporate" ? userData.foundedYear : null,
      // University specific
      affiliated_college: userType === "university" ? userData.affiliatedCollege : null,
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // This data is for auth.users metadata, limited use.
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userType,
            // Role is better stored in profiles table directly
          },
        },
      })

      if (authError) {
        console.error("AuthContext: Supabase auth.signUp error:", authError)
        throw authError
      }

      if (!authData.user) {
        console.error("AuthContext: Supabase auth.signUp did not return a user.")
        throw new Error("Sign up failed, user not created.")
      }

      // Insert into public.profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({ id: authData.user.id, ...profileDataToInsert, updated_at: new Date().toISOString() })

      if (profileError) {
        console.error("AuthContext: Error inserting profile data:", profileError)
        // Potentially try to delete the auth user if profile insert fails to avoid orphaned auth user
        // await supabase.auth.admin.deleteUser(authData.user.id) // Requires admin privileges
        throw profileError
      }

      console.log("AuthContext: Sign up and profile creation successful. User ID:", authData.user.id)
      // onAuthStateChange will fire and handle setting user & profile state, then redirection.
    } catch (error) {
      setLoading(false) // Ensure loading is false on catch
      throw error
    }
    // setLoading(false) will be handled by onAuthStateChange or its finally block
  }

  const signOut = async () => {
    console.log("AuthContext: Signing out.")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("AuthContext: Sign out error:", error)
        throw error
      }
      // onAuthStateChange will set user and profile to null
      // Explicitly clear local state too for faster UI update if needed, though onAuthStateChange should suffice
      setUser(null)
      setProfile(null)
      router.push("/login") // Force redirect to login on sign out
    } catch (error) {
      console.error("AuthContext: Sign out error:", error)
    } finally {
      setLoading(false) // Ensure loading is false
    }
  }

  console.log("AuthContext Provider rendering. State:", {
    user: user?.id,
    profileLoaded: !!profile,
    userType: profile?.user_type,
    role: profile?.role,
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

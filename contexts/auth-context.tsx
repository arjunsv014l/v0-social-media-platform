"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types" // Ensure this type is comprehensive

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean // True while initial auth check or during auth operations
  authChecked: boolean // True once initial auth check is complete
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void> // Changed return type to Promise<void> for consistency
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup"]
const profileCompletionPath = "/profile/complete"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true) // Start true for initial load
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log("AuthContext: Fetching profile for user ID:", userId)
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine if profile not yet created
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
      // No return needed if Promise<void>
    }
    // No return needed
  }, [user?.id, fetchProfile])

  const getDashboardPath = useCallback((userType?: string) => {
    switch (userType) {
      case "student":
        return "/" // Student dashboard is the main feed
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      default:
        console.warn("AuthContext: Unknown user type for dashboard path:", userType)
        return "/" // Default to student dashboard or a generic landing
    }
  }, [])

  // Effect for initial auth check and subscription
  useEffect(() => {
    console.log("AuthContext: Initializing auth state listener.")
    setLoading(true)

    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("AuthContext: Error getting session:", sessionError)
        }
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
      setLoading(true) // Set loading true during state change processing
      const activeUser = session?.user ?? null
      setUser(activeUser)

      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false) // Done processing state change
      setAuthChecked(true) // Ensure authChecked is true after any state change
      console.log("AuthContext: Auth state change processed. Loading:", false)
    })
    return () => {
      console.log("AuthContext: Unsubscribing auth listener.")
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Effect for handling redirection
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
      // User is logged in
      if (profile) {
        // Profile data exists
        if (!profile.is_profile_complete) {
          if (!isProfileCompletePage) {
            console.log("AuthContext: User logged in, profile incomplete. Redirecting to:", profileCompletionPath)
            router.push(profileCompletionPath)
          } else {
            console.log("AuthContext: User on profile completion page.")
          }
        } else {
          // Profile is complete
          const dashboardPath = getDashboardPath(profile.user_type)
          if (isAuthPage || isProfileCompletePage) {
            console.log(
              "AuthContext: User logged in, profile complete. On auth/complete page. Redirecting to dashboard:",
              dashboardPath,
            )
            router.push(dashboardPath)
          } else {
            if (pathname !== dashboardPath && !pathname.startsWith("/api")) {
              const currentBaseDashboard = pathname.split("/")[1]
              const targetBaseDashboard = dashboardPath.split("/")[1]
              if (dashboardPath !== "/" && currentBaseDashboard !== targetBaseDashboard && profile.user_type) {
                console.log(`AuthContext: User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
                router.push(dashboardPath)
              } else {
                console.log(
                  "AuthContext: User logged in, profile complete. On a valid page or their dashboard:",
                  dashboardPath,
                )
              }
            }
          }
        }
      } else {
        console.log("AuthContext: User logged in, but profile is null. Waiting for profile.")
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
        options: {
          data: {
            // This data is for auth.users metadata, limited use.
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userData.userType,
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

      // Construct profile data for insertion
      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        email: authData.user.email, // Store email in profile for convenience
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7), // Default username
        user_type: userData.userType,
        is_profile_complete: false, // CRUCIAL: New profiles are incomplete
        updated_at: new Date().toISOString(),
      }

      if (userData.userType === "student") {
        profileToInsert.university = userData.university
        profileToInsert.major = userData.major
        profileToInsert.graduation_year = userData.graduationYear // from StudentSignupForm
        profileToInsert.student_id_number = userData.studentId
      } else if (userData.userType === "professional") {
        // Add professional specific fields from userData if provided
        profileToInsert.job_title = userData.jobTitle
        profileToInsert.company = userData.company
        profileToInsert.industry = userData.industry
        // ... etc.
      } else if (userData.userType === "corporate") {
        // Add corporate specific fields from userData if provided
        profileToInsert.company_name = userData.companyName
        profileToInsert.company_website = userData.companyWebsite
        // ... etc.
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile) // Cast to Profile, ensure all required fields are present or DB handles defaults

      if (profileError) {
        console.error("AuthContext: Error inserting profile data:", profileError)
        // Potentially try to delete the auth user if profile insert fails to avoid orphaned auth user
        // This requires admin privileges: await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError
      }

      console.log("AuthContext: Sign up and initial profile creation successful. User ID:", authData.user.id)
      // onAuthStateChange will fire and handle setting user & profile state, then redirection.
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log("AuthContext: Signing out.")
    setLoading(true)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error("AuthContext: Supabase sign out error:", signOutError)
        throw signOutError
      }
      setUser(null)
      setProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("AuthContext: Error during sign out process:", error)
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

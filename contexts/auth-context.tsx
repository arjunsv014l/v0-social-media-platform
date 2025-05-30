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
  signUp: (email: string, password: string, userData: any) => Promise<void> // userData is for initial profile fields
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
        // PGRST116 means no rows found, which is not an error for a new user
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
        return "/" // Student main feed
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      case "university":
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
        } = await supabase.auth.getSession()
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
      console.log("AuthContext: Redirect check skipped - loading or auth not checked.")
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
    })

    if (user) {
      if (profile) {
        // Profile has been fetched
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
            // Optional: Redirect if on the wrong dashboard type
            const currentBase = pathname.split("/")[1]
            const targetBase = dashboardPath.split("/")[1]
            if (targetBase && currentBase !== targetBase && !pathname.startsWith("/api") && dashboardPath !== "/") {
              console.log(`AuthContext: User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
              router.push(dashboardPath)
            } else {
              console.log("AuthContext: User logged in, profile complete. On a valid page or their dashboard.")
            }
          }
        }
      } else if (!loading) {
        // User is logged in, but profile is null (and not loading)
        // This could happen if profile creation failed or is delayed.
        // For now, we don't redirect from profile completion page if profile is null.
        // If not on profile completion or auth page, it's an odd state.
        console.warn(
          "AuthContext: User logged in, but profile is null after loading. This might indicate an issue with profile creation/fetching.",
        )
        if (!isProfileCompletePage && !isAuthPage) {
          // Potentially redirect to login or an error page if profile is consistently missing.
          // router.push("/login"); // This might be too aggressive.
        }
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
      // onAuthStateChange will handle setting user and profile, then redirection effect will run
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
            // Data for auth.users table (limited use, prefer profiles table)
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

      // Prepare initial profile data for the 'profiles' table
      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7), // Default username
        user_type: userData.userType,
        is_profile_complete: false, // New users must complete their profile
        updated_at: new Date().toISOString(),
        // Add student-specific fields if userType is student
        ...(userData.userType === "student" && {
          university: userData.university,
          major: userData.major,
          graduation_year: userData.graduationYear,
          student_id_number: userData.studentId,
        }),
        // Add other role-specific fields as needed
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile)

      if (profileError) {
        console.error("AuthContext: Error inserting profile data:", profileError)
        // Consider deleting the auth user if profile insert fails to avoid orphaned auth user
        // await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
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
    console.log("AuthContext: Attempting Supabase sign out.")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("AuthContext: Supabase sign out error:", error)
        throw error
      }
      console.log("AuthContext: Supabase sign out command successful. Waiting for onAuthStateChange.")
      // onAuthStateChange will clear user/profile and trigger redirection useEffect
    } catch (error) {
      console.error("AuthContext: Error during signOut initiation:", error)
      throw error // Re-throw to allow UI to catch it
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

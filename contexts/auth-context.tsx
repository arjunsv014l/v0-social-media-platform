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
  signIn: (email: string, password: string, userTypeAttempt: Profile["user_type"]) => Promise<void>
  signUp: (
    userData: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & { email: string; password?: string },
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup"]

// Define specific colleges
const COLLEGES = ["SIMATS", "VIT", "SRM"] as const
type CollegeName = (typeof COLLEGES)[number]

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

  const getDashboardPath = useCallback((userType?: Profile["user_type"]) => {
    switch (userType) {
      case "student":
        return "/" // Student home feed
      case "university":
        return "/university/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      default:
        console.warn("AuthContext: Unknown user type for dashboard path:", userType)
        return "/"
    }
  }, [])

  useEffect(() => {
    console.log("AuthContext: Initializing auth state listener.")
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("AuthContext: Error getting session:", sessionError)
        }

        if (!mounted) return

        const activeUser = session?.user ?? null
        setUser(activeUser)
        console.log("AuthContext: Initial session user:", activeUser?.id)

        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          if (mounted) {
            setProfile(userProfile)
          }
        } else {
          if (mounted) {
            setProfile(null)
          }
        }
      } catch (error) {
        console.error("AuthContext: Error in initial auth setup:", error)
      } finally {
        if (mounted) {
          setLoading(false)
          setAuthChecked(true)
          console.log("AuthContext: Initial auth check complete")
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed. Event:", event, "Session User:", session?.user?.id)

      if (!mounted) return

      const activeUser = session?.user ?? null
      setUser(activeUser)

      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id)
        if (mounted) {
          setProfile(userProfile)
        }
      } else {
        if (mounted) {
          setProfile(null)
        }
      }

      if (mounted) {
        setLoading(false)
        setAuthChecked(true)
      }
    })

    return () => {
      mounted = false
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
      const dashboardPath = getDashboardPath(profile.user_type)
      if (isAuthPage) {
        console.log("AuthContext: User logged in, on auth page. Redirecting to dashboard:", dashboardPath)
        router.push(dashboardPath)
      } else {
        // Optional: Ensure user is on their correct dashboard type if already logged in
        const currentPathBase = pathname.split("/")[1] // e.g. "university" from "/university/dashboard"
        const targetPathBase = dashboardPath.split("/")[1]

        if (
          dashboardPath !== "/" &&
          currentPathBase !== targetPathBase &&
          profile.user_type &&
          !pathname.startsWith("/api")
        ) {
          // If not on home, and not on the correct dashboard base, and not an API route
          if (
            (profile.user_type === "university" && currentPathBase !== "university") ||
            (profile.user_type === "corporate" && currentPathBase !== "corporate") ||
            (profile.user_type === "student" &&
              dashboardPath === "/" &&
              currentPathBase !== "" &&
              currentPathBase !== "profile" &&
              currentPathBase !== "settings" &&
              currentPathBase !== "messages" &&
              currentPathBase !== "friends" &&
              currentPathBase !== "events" &&
              currentPathBase !== "courses" &&
              currentPathBase !== "create") // Student can be on root or other allowed pages
          ) {
            console.log(
              `AuthContext: User on wrong page type (${pathname}) for role ${profile.user_type}, redirecting to ${dashboardPath}`,
            )
            router.push(dashboardPath)
          }
        }
        console.log("AuthContext: User logged in. On a valid page or their dashboard:", pathname)
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
    // If user is logged in but profile is still null (e.g. during initial load after login), wait for profile.
  }, [user, profile, loading, authChecked, pathname, router, getDashboardPath])

  const signIn = async (email: string, password: string, userTypeAttempt: Profile["user_type"]) => {
    console.log("AuthContext: Attempting sign in for:", email, "as", userTypeAttempt)
    setLoading(true)
    try {
      // Check if profile exists with correct user type
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("email", email)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("AuthContext: Error fetching profile for sign-in check:", profileError)
        throw new Error("Failed to verify user type. Please try again.")
      }

      if (!existingProfile) {
        throw new Error("User not found. Please check your email or sign up.")
      }

      if (existingProfile.user_type !== userTypeAttempt) {
        throw new Error(`Incorrect user type selected. This email is registered as a ${existingProfile.user_type}.`)
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        console.error("AuthContext: Sign in error:", signInError)
        throw signInError
      }
      console.log("AuthContext: Sign in successful")
      // Don't set loading to false here - let onAuthStateChange handle it
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (
    userDataWithAuth: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & {
      email: string
      password?: string
    },
  ) => {
    const { email, password, user_type, full_name, ...profileData } = userDataWithAuth
    console.log("AuthContext: Attempting sign up for:", email, "as", user_type)
    setLoading(true)

    if (!password) {
      setLoading(false)
      throw new Error("Password is required for signup.")
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        console.error("AuthContext: Supabase sign up error:", signUpError)
        throw signUpError
      }

      if (!authData.user) {
        console.error("AuthContext: Supabase sign up did not return a user.")
        throw new Error("Sign up failed. Please try again.")
      }

      console.log("AuthContext: Supabase sign up successful. User ID:", authData.user.id)

      let role_description = ""
      if (user_type === "student") {
        const studentProfile = profileData as Pick<Profile, "college_name" | "year_of_study" | "degree">
        if (!studentProfile.college_name || !studentProfile.year_of_study || !studentProfile.degree) {
          throw new Error("Missing college, year, or degree for student signup.")
        }
        role_description = `${studentProfile.college_name} ${studentProfile.year_of_study} year ${studentProfile.degree}`
      }

      const newProfile: Omit<Profile, "updated_at" | "avatar_url"> & { id: string } = {
        id: authData.user.id,
        email: authData.user.email, // Store email in profile for easier access
        username: email.split("@")[0] + Math.random().toString(36).substring(2, 7), // Basic unique username
        full_name,
        user_type,
        ...profileData,
        ...(user_type === "student" && { role_description }),
      }

      const { error: profileInsertError } = await supabase.from("profiles").insert(newProfile)

      if (profileInsertError) {
        console.error("AuthContext: Error inserting profile:", profileInsertError)
        // Potentially try to delete the auth user if profile insert fails to avoid orphaned auth user
        // await supabase.auth.admin.deleteUser(authData.user.id) // Requires admin privileges
        throw new Error("Failed to create user profile. Please try again.")
      }

      console.log("AuthContext: Profile successfully inserted for new user.")
      // onAuthStateChange will handle setting user and profile state, then redirection effect will run.
      // No explicit router.push here, let the effects handle it.
    } catch (error) {
      setLoading(false) // Ensure loading is false on any error during sign-up
      throw error
    }
    // setLoading(false) will be handled by onAuthStateChange or its finally block after successful profile insert
  }

  const signOut = async () => {
    console.log("AuthContext: Signing out.")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear state immediately
      setUser(null)
      setProfile(null)
      setLoading(false)
      setAuthChecked(true)

      console.log("AuthContext: Sign out successful")
    } catch (error) {
      console.error("AuthContext: Sign out error:", error)
      setLoading(false)
      throw error
    }
  }

  console.log("AuthContext Provider rendering. State:", {
    user: user?.id,
    profile: !!profile,
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

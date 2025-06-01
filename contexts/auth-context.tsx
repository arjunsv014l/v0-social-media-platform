"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
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
    userData: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & { email: string; password: string },
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Refs to prevent race conditions
  const mountedRef = useRef(true)
  const redirectingRef = useRef(false)
  const lastRedirectRef = useRef<string | null>(null)

  // Fetch user profile from Supabase
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("[AuthContext] Profile not found for user:", userId)
          return null
        }
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }

      console.log("[AuthContext] Profile fetched successfully")
      return data as Profile
    } catch (error) {
      console.error("[AuthContext] Exception in fetchProfile:", error)
      return null
    }
  }, [])

  // Refresh the user profile
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) return null

    try {
      console.log("[AuthContext] Refreshing profile...")
      const updatedProfile = await fetchProfile(user.id)

      if (mountedRef.current) {
        setProfile(updatedProfile)
      }

      return updatedProfile
    } catch (error) {
      console.error("[AuthContext] Error refreshing profile:", error)
      return null
    }
  }, [user?.id, fetchProfile])

  // Get the appropriate dashboard path based on user type
  const getDashboardPath = useCallback((userType?: Profile["user_type"]): string => {
    switch (userType) {
      case "student":
        return "/"
      case "university":
        return "/university/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      default:
        return "/"
    }
  }, [])

  // Safe redirect function to prevent race conditions
  const safeRedirect = useCallback(
    (path: string, reason: string) => {
      if (!mountedRef.current || redirectingRef.current || pathname === path || lastRedirectRef.current === path) {
        return
      }

      console.log(`[AuthContext] Redirecting to ${path}: ${reason}`)
      redirectingRef.current = true
      lastRedirectRef.current = path

      router.push(path)

      // Reset redirect flag after a delay
      setTimeout(() => {
        if (mountedRef.current) {
          redirectingRef.current = false
        }
      }, 1000)
    },
    [router, pathname],
  )

  // Initialize auth state and set up listeners
  useEffect(() => {
    console.log("[AuthContext] Initializing auth state")
    mountedRef.current = true

    const initAuth = async () => {
      try {
        setLoading(true)

        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("[AuthContext] Session error:", sessionError)
          throw sessionError
        }

        if (!mountedRef.current) return

        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          console.log("[AuthContext] User found in session:", currentUser.id)
          const userProfile = await fetchProfile(currentUser.id)

          if (mountedRef.current) {
            setProfile(userProfile)
          }
        } else {
          console.log("[AuthContext] No user in session")
          if (mountedRef.current) {
            setProfile(null)
          }
        }
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error)
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setAuthChecked(true)
          console.log("[AuthContext] Auth initialization complete")
        }
      }
    }

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed:", event)

      if (!mountedRef.current) return

      const currentUser = session?.user || null

      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setLoading(false)
        lastRedirectRef.current = null
        return
      }

      setUser(currentUser)

      if (currentUser) {
        // For sign up events, wait a bit for profile creation
        if (event === "SIGNED_UP") {
          console.log("[AuthContext] New signup detected, waiting for profile...")
          // Wait for profile creation with retries
          let retries = 0
          const maxRetries = 5
          let userProfile = null

          while (retries < maxRetries && !userProfile && mountedRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            userProfile = await fetchProfile(currentUser.id)
            retries++
          }

          if (mountedRef.current) {
            setProfile(userProfile)
            setLoading(false)
          }
        } else {
          const userProfile = await fetchProfile(currentUser.id)

          if (mountedRef.current) {
            setProfile(userProfile)
            setLoading(false)
          }
        }
      } else {
        if (mountedRef.current) {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    // Initialize auth
    initAuth()

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Handle redirects based on auth state
  useEffect(() => {
    if (loading || !authChecked || redirectingRef.current) {
      return
    }

    const isPublicPath = publicPaths.includes(pathname)

    console.log("[AuthContext] Checking redirects:", {
      pathname,
      isPublicPath,
      hasUser: !!user,
      hasProfile: !!profile,
      userType: profile?.user_type,
    })

    if (user && profile) {
      // User is authenticated with profile
      if (isPublicPath) {
        // Redirect from public pages to dashboard
        const dashboardPath = getDashboardPath(profile.user_type)
        safeRedirect(dashboardPath, "Authenticated user on public page")
      }
    } else if (!user && !isPublicPath) {
      // No user and not on public page
      safeRedirect("/login", "Unauthenticated user on protected page")
    }
  }, [user, profile, loading, authChecked, pathname, getDashboardPath, safeRedirect])

  // Sign in function
  const signIn = async (email: string, password: string, userTypeAttempt: Profile["user_type"]) => {
    console.log("[AuthContext] Attempting sign in:", email)
    setLoading(true)

    try {
      // First attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[AuthContext] Sign in error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("Sign in failed - no user returned")
      }

      // Fetch profile to verify user type
      const userProfile = await fetchProfile(data.user.id)

      if (!userProfile) {
        // Sign out if profile doesn't exist
        await supabase.auth.signOut()
        throw new Error("User profile not found. Please contact support.")
      }

      if (userProfile.user_type !== userTypeAttempt) {
        // Sign out if wrong user type
        await supabase.auth.signOut()
        throw new Error(`Incorrect user type. This account is registered as a ${userProfile.user_type}.`)
      }

      // Success - let auth state listener handle the rest
      console.log("[AuthContext] Sign in successful")
    } catch (error: any) {
      setLoading(false)
      throw error
    }
  }

  // Sign up function
  const signUp = async (
    userData: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & { email: string; password: string },
  ) => {
    const { email, password, user_type, full_name, ...profileData } = userData
    console.log("[AuthContext] Attempting sign up:", email)
    setLoading(true)

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            user_type,
          },
        },
      })

      if (error) {
        console.error("[AuthContext] Sign up error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("Sign up failed - no user returned")
      }

      console.log("[AuthContext] Auth user created:", data.user.id)

      // Generate username from email with random suffix
      const username = email.split("@")[0] + Math.random().toString(36).substring(2, 7)

      // Create role description for students
      let role_description = ""
      if (user_type === "student") {
        const studentProfile = profileData as any
        role_description = `${studentProfile.college_name} ${studentProfile.year_of_study} year ${studentProfile.degree}`
      }

      // Create profile
      const newProfile = {
        id: data.user.id,
        email,
        username,
        full_name,
        user_type,
        ...profileData,
        ...(user_type === "student" && { role_description }),
      }

      const { error: profileError } = await supabase.from("profiles").insert(newProfile)

      if (profileError) {
        console.error("[AuthContext] Profile creation error:", profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log("[AuthContext] Profile created successfully")

      // Auth state listener will handle the rest
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // Sign out function
  const signOut = async () => {
    console.log("[AuthContext] Signing out")

    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[AuthContext] Sign out error:", error)
        throw error
      }

      // Clear state immediately
      setUser(null)
      setProfile(null)
      lastRedirectRef.current = null

      console.log("[AuthContext] Sign out successful")

      // Redirect to login
      safeRedirect("/login", "User signed out")
    } catch (error) {
      console.error("[AuthContext] Sign out failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authChecked,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
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

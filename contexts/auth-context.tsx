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
  error: string | null
  signIn: (email: string, password: string, userTypeAttempt: Profile["user_type"]) => Promise<void>
  signUp: (
    userData: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & { email: string; password: string },
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<Profile | null>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicPaths = ["/login", "/signup", "/forgot-password"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Refs to prevent race conditions and memory leaks
  const mountedRef = useRef(true)
  const redirectingRef = useRef(false)
  const lastRedirectRef = useRef<string | null>(null)
  const initializingRef = useRef(false)

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch user profile with timeout and error handling
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId)

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Profile fetch timeout")), 10000)
      })

      const fetchPromise = supabase.from("profiles").select("*").eq("id", userId).single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        if (error.code === "PGRST116") {
          console.log("[AuthContext] Profile not found for user:", userId)
          return null
        }
        console.error("[AuthContext] Error fetching profile:", error)
        throw error
      }

      console.log("[AuthContext] Profile fetched successfully")
      return data as Profile
    } catch (error) {
      console.error("[AuthContext] Exception in fetchProfile:", error)
      setError("Failed to load user profile")
      return null
    }
  }, [])

  // Refresh the user profile
  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id || !mountedRef.current) return null

    try {
      console.log("[AuthContext] Refreshing profile...")
      const updatedProfile = await fetchProfile(user.id)

      if (mountedRef.current) {
        setProfile(updatedProfile)
      }

      return updatedProfile
    } catch (error) {
      console.error("[AuthContext] Error refreshing profile:", error)
      if (mountedRef.current) {
        setError("Failed to refresh profile")
      }
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

  // Safe redirect function with debouncing
  const safeRedirect = useCallback(
    (path: string, reason: string) => {
      if (!mountedRef.current || redirectingRef.current || pathname === path || lastRedirectRef.current === path) {
        return
      }

      console.log(`[AuthContext] Redirecting to ${path}: ${reason}`)
      redirectingRef.current = true
      lastRedirectRef.current = path

      // Use replace for auth redirects to prevent back button issues
      router.replace(path)

      // Reset redirect flag
      setTimeout(() => {
        if (mountedRef.current) {
          redirectingRef.current = false
        }
      }, 1000)
    },
    [router, pathname],
  )

  // Initialize auth state with proper error handling and timeouts
  useEffect(() => {
    if (initializingRef.current) return

    console.log("[AuthContext] Initializing auth state")
    mountedRef.current = true
    initializingRef.current = true

    const initAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Add timeout for session fetch
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Session fetch timeout")), 10000)
        })

        const {
          data: { session },
          error: sessionError,
        } = await Promise.race([sessionPromise, timeoutPromise])

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
      } catch (error: any) {
        console.error("[AuthContext] Error initializing auth:", error)
        if (mountedRef.current) {
          setError(error.message || "Authentication initialization failed")
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setAuthChecked(true)
          console.log("[AuthContext] Auth initialization complete")
        }
      }
    }

    // Set up auth state change listener with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed:", event)

      if (!mountedRef.current) return

      try {
        const currentUser = session?.user || null

        if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setError(null)
          lastRedirectRef.current = null
          return
        }

        setUser(currentUser)

        if (currentUser) {
          let userProfile = null

          if (event === "SIGNED_UP") {
            console.log("[AuthContext] New signup detected, waiting for profile...")
            // Retry logic for new signups
            let retries = 0
            const maxRetries = 5

            while (retries < maxRetries && !userProfile && mountedRef.current) {
              await new Promise((resolve) => setTimeout(resolve, 1000))
              userProfile = await fetchProfile(currentUser.id)
              retries++
              console.log(`[AuthContext] Profile fetch attempt ${retries}`)
            }
          } else {
            userProfile = await fetchProfile(currentUser.id)
          }

          if (mountedRef.current) {
            setProfile(userProfile)
            setLoading(false)
          }
        } else {
          if (mountedRef.current) {
            setProfile(null)
            setLoading(false)
          }
        }
      } catch (error: any) {
        console.error("[AuthContext] Error in auth state change:", error)
        if (mountedRef.current) {
          setError(error.message || "Authentication state change failed")
          setLoading(false)
        }
      }
    })

    // Initialize auth
    initAuth()

    return () => {
      mountedRef.current = false
      initializingRef.current = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Handle redirects with proper state checks
  useEffect(() => {
    if (loading || !authChecked || redirectingRef.current || error) {
      return
    }

    const isPublicPath = publicPaths.includes(pathname)

    console.log("[AuthContext] Checking redirects:", {
      pathname,
      isPublicPath,
      hasUser: !!user,
      hasProfile: !!profile,
      userType: profile?.user_type,
      loading,
      authChecked,
    })

    if (user && profile) {
      // User is authenticated with profile
      if (isPublicPath) {
        const dashboardPath = getDashboardPath(profile.user_type)
        safeRedirect(dashboardPath, "Authenticated user on public page")
      }
    } else if (!user && !isPublicPath) {
      // No user and not on public page
      safeRedirect("/login", "Unauthenticated user on protected page")
    }
  }, [user, profile, loading, authChecked, pathname, getDashboardPath, safeRedirect, error])

  // Sign in function with timeout and error handling
  const signIn = async (email: string, password: string, userTypeAttempt: Profile["user_type"]) => {
    console.log("[AuthContext] Attempting sign in:", email)
    setLoading(true)
    setError(null)

    try {
      // Add timeout for sign in
      const signInPromise = supabase.auth.signInWithPassword({ email, password })
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Sign in timeout")), 15000)
      })

      const { data, error } = await Promise.race([signInPromise, timeoutPromise])

      if (error) {
        console.error("[AuthContext] Sign in error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("Sign in failed - no user returned")
      }

      // Verify user type
      const userProfile = await fetchProfile(data.user.id)

      if (!userProfile) {
        await supabase.auth.signOut()
        throw new Error("User profile not found. Please contact support.")
      }

      if (userProfile.user_type !== userTypeAttempt) {
        await supabase.auth.signOut()
        throw new Error(`Incorrect user type. This account is registered as a ${userProfile.user_type}.`)
      }

      console.log("[AuthContext] Sign in successful")
      // Auth state listener will handle the rest
    } catch (error: any) {
      console.error("[AuthContext] Sign in failed:", error)
      setLoading(false)
      setError(error.message || "Sign in failed")
      throw error
    }
  }

  // Sign up function with proper error handling
  const signUp = async (
    userData: Omit<Profile, "id" | "updated_at" | "avatar_url" | "username"> & { email: string; password: string },
  ) => {
    const { email, password, user_type, full_name, ...profileData } = userData
    console.log("[AuthContext] Attempting sign up:", email)
    setLoading(true)
    setError(null)

    try {
      // Create auth user with timeout
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            user_type,
          },
        },
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Sign up timeout")), 15000)
      })

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise])

      if (error) {
        console.error("[AuthContext] Sign up error:", error)
        throw error
      }

      if (!data.user) {
        throw new Error("Sign up failed - no user returned")
      }

      console.log("[AuthContext] Auth user created:", data.user.id)

      // Create profile
      const username = email.split("@")[0] + Math.random().toString(36).substring(2, 7)
      let role_description = ""

      if (user_type === "student") {
        const studentProfile = profileData as any
        role_description = `${studentProfile.college_name} ${studentProfile.year_of_study} year ${studentProfile.degree}`
      }

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
    } catch (error: any) {
      console.error("[AuthContext] Sign up failed:", error)
      setLoading(false)
      setError(error.message || "Sign up failed")
      throw error
    }
  }

  // Sign out function with proper cleanup
  const signOut = async () => {
    console.log("[AuthContext] Signing out")
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[AuthContext] Sign out error:", error)
        throw error
      }

      // Clear state immediately
      setUser(null)
      setProfile(null)
      setLoading(false)
      lastRedirectRef.current = null

      console.log("[AuthContext] Sign out successful")
      safeRedirect("/login", "User signed out")
    } catch (error: any) {
      console.error("[AuthContext] Sign out failed:", error)
      setError(error.message || "Sign out failed")
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authChecked,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        clearError,
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

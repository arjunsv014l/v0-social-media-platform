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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define route configurations
const publicPaths = ["/login", "/signup", "/forgot-password"]
const profileCompletionPath = "/profile/complete"

// Dashboard paths for different user types
const getDashboardPath = (userType: Profile["user_type"]): string => {
  switch (userType) {
    case "student":
      return "/"
    case "professional":
      return "/professional/dashboard"
    case "corporate":
      return "/corporate/dashboard"
    case "university":
      return "/university/dashboard"
    default:
      return "/"
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Refs to prevent infinite operations
  const mountedRef = useRef(true)
  const lastRedirectRef = useRef<string | null>(null)
  const isRedirectingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId)
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("[AuthContext] Profile not found for user:", userId)
          return null
        }
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }

      console.log("[AuthContext] Profile fetched successfully:", {
        user_type: profileData.user_type,
        is_profile_complete: profileData.is_profile_complete,
      })

      return profileData as Profile
    } catch (error) {
      console.error("[AuthContext] Exception in fetchProfile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log("[AuthContext] Refreshing profile...")
      const updatedProfile = await fetchProfile(user.id)
      if (mountedRef.current) {
        setProfile(updatedProfile)
      }
      return updatedProfile
    }
    return null
  }, [user?.id, fetchProfile])

  // Perform redirect with safeguards
  const performRedirect = useCallback(
    (path: string, reason: string) => {
      if (!mountedRef.current || isRedirectingRef.current || pathname === path || lastRedirectRef.current === path) {
        console.log(`[AuthContext] Redirect to ${path} skipped - already redirecting or same path`)
        return
      }

      console.log(`[AuthContext] Redirecting to ${path} - ${reason}`)
      isRedirectingRef.current = true
      lastRedirectRef.current = path

      router.replace(path)

      // Reset redirect flag after delay
      setTimeout(() => {
        if (mountedRef.current) {
          isRedirectingRef.current = false
        }
      }, 1000)
    },
    [router, pathname],
  )

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("[AuthContext] Initializing auth...")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        const currentUser = session?.user ?? null
        console.log("[AuthContext] Initial session:", currentUser ? "User found" : "No user")

        setUser(currentUser)

        if (currentUser) {
          const userProfile = await fetchProfile(currentUser.id)
          if (mounted) {
            setProfile(userProfile)
          }
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("[AuthContext] Error in auth initialization:", error)
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
          console.log("[AuthContext] Auth initialization complete")
        }
      }
    }

    initializeAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("[AuthContext] Auth state changed:", event, session?.user?.id)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // For sign up events, wait a bit for profile creation
        if (event === "SIGNED_UP") {
          console.log("[AuthContext] New signup detected, waiting for profile...")
          // Wait for profile creation with retries
          let retries = 0
          const maxRetries = 10
          let userProfile = null

          while (retries < maxRetries && !userProfile && mounted) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            userProfile = await fetchProfile(currentUser.id)
            retries++
            console.log(`[AuthContext] Profile fetch attempt ${retries}:`, userProfile ? "Found" : "Not found")
          }

          if (mounted) {
            setProfile(userProfile)
            setLoading(false)
          }
        } else {
          // For other events, fetch profile immediately
          const userProfile = await fetchProfile(currentUser.id)
          if (mounted) {
            setProfile(userProfile)
            setLoading(false)
          }
        }
      } else {
        if (mounted) {
          setProfile(null)
          setLoading(false)
          lastRedirectRef.current = null
          isRedirectingRef.current = false
        }
      }
    })

    return () => {
      mounted = false
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Handle redirections
  useEffect(() => {
    if (!initialized || loading || isRedirectingRef.current) {
      return
    }

    const isPublicPath = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    console.log("[AuthContext] Evaluating redirections:", {
      pathname,
      user: !!user,
      profile: profile ? { type: profile.user_type, complete: profile.is_profile_complete } : null,
      isPublicPath,
      isProfileCompletePage,
      loading,
      initialized,
    })

    // No user - redirect to login unless on public pages
    if (!user) {
      if (!isPublicPath) {
        performRedirect("/login", "No user authenticated")
      }
      return
    }

    // User exists but no profile - redirect to login (profile creation failed)
    if (!profile) {
      console.log("[AuthContext] User exists but no profile found, redirecting to login")
      performRedirect("/login", "Profile not found")
      return
    }

    // User and profile exist - handle redirections based on profile state
    const needsCompletion = profile.is_profile_complete !== true
    const dashboardPath = getDashboardPath(profile.user_type)

    if (needsCompletion) {
      // Profile incomplete - redirect to completion page
      if (!isProfileCompletePage) {
        performRedirect(profileCompletionPath, "Profile needs completion")
      }
    } else {
      // Profile complete - redirect away from auth/completion pages to dashboard
      if (isPublicPath || isProfileCompletePage) {
        performRedirect(dashboardPath, "Redirecting to dashboard")
      }
    }
  }, [initialized, loading, user, profile, pathname, performRedirect])

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] Starting sign in process...")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[AuthContext] Sign in error:", error)
        throw error
      }

      console.log("[AuthContext] Sign in successful, user:", data.user?.id)

      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error("[AuthContext] Sign in failed:", error)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("[AuthContext] Starting sign up process...")
    setLoading(true)

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userData.userType,
          },
        },
      })

      if (authError) {
        console.error("[AuthContext] Auth signup error:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("Sign up failed - no user returned")
      }

      console.log("[AuthContext] Auth user created:", authData.user.id)

      // Step 2: Create profile
      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7),
        user_type: userData.userType,
        is_profile_complete: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        // Add user-type specific fields
        ...(userData.userType === "student" && {
          university: userData.university,
          major: userData.major,
          graduation_year: userData.graduationYear,
          student_id_number: userData.studentId,
        }),
        ...(userData.userType === "professional" && {
          company: userData.company,
          position: userData.position,
          experience_years: userData.experienceYears,
          industry: userData.industry,
        }),
        ...(userData.userType === "corporate" && {
          company: userData.company,
          industry: userData.industry,
          company_size: userData.companySize,
        }),
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile)

      if (profileError) {
        console.error("[AuthContext] Profile creation error:", profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log("[AuthContext] Profile created successfully")

      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error("[AuthContext] Sign up failed:", error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log("[AuthContext] Starting sign out...")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Reset state
      setUser(null)
      setProfile(null)
      lastRedirectRef.current = null
      isRedirectingRef.current = false

      console.log("[AuthContext] Sign out successful")
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error)
      throw error
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

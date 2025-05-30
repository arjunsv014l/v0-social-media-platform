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
  const isInitializingRef = useRef(false)
  const lastRedirectRef = useRef<string | null>(null)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }

      return profileData as Profile | null
    } catch (error) {
      console.error("[AuthContext] Exception in fetchProfile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
      return updatedProfile
    }
    return null
  }, [user?.id, fetchProfile])

  // Simplified redirect function
  const performRedirect = useCallback(
    (path: string, reason: string) => {
      // Prevent redirecting to the same path
      if (pathname === path || lastRedirectRef.current === path) {
        return
      }

      console.log(`[AuthContext] Redirecting to ${path} - ${reason}`)
      lastRedirectRef.current = path

      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }

      // Debounce redirects
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace(path)
        lastRedirectRef.current = null
      }, 100)
    },
    [router, pathname],
  )

  // Initialize auth state - runs once on mount
  useEffect(() => {
    if (isInitializingRef.current) return

    isInitializingRef.current = true
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("[AuthContext] Initializing auth...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        const currentUser = session?.user ?? null
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
          isInitializingRef.current = false
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

      console.log("[AuthContext] Auth state changed:", event)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser && event !== "TOKEN_REFRESHED") {
        const userProfile = await fetchProfile(currentUser.id)
        if (mounted) {
          setProfile(userProfile)
        }
      } else if (!currentUser) {
        if (mounted) {
          setProfile(null)
          lastRedirectRef.current = null
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [fetchProfile])

  // Simplified redirection logic
  useEffect(() => {
    if (!initialized || loading) {
      return
    }

    const isPublicPath = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    // No user - redirect to login unless on public pages
    if (!user) {
      if (!isPublicPath) {
        performRedirect("/login", "No user, redirecting to login")
      }
      return
    }

    // User exists but no profile - wait for profile to load
    if (!profile) {
      return
    }

    // User and profile exist - handle redirections
    const needsCompletion = profile.is_profile_complete !== true
    const dashboardPath = getDashboardPath(profile.user_type)

    if (needsCompletion) {
      // Profile incomplete - redirect to completion page
      if (!isProfileCompletePage && !isPublicPath) {
        performRedirect(profileCompletionPath, "Profile incomplete")
      }
    } else {
      // Profile complete - redirect away from auth/completion pages
      if (isPublicPath || isProfileCompletePage) {
        performRedirect(dashboardPath, "Profile complete")
      }
    }
  }, [initialized, loading, user, profile, pathname, performRedirect])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    try {
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

      if (authError) throw authError
      if (!authData.user) throw new Error("Sign up failed")

      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7),
        user_type: userData.userType,
        is_profile_complete: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
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
        }),
        ...(userData.userType === "corporate" && {
          company: userData.company,
          industry: userData.industry,
          company_size: userData.companySize,
        }),
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile)
      if (profileError) throw profileError
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      lastRedirectRef.current = null
    } catch (error) {
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

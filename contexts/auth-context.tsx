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

const publicPaths = ["/login", "/signup"]
const profileCompletionPath = "/profile/complete"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Refs to prevent infinite loops
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRedirectRef = useRef<string | null>(null)
  const isRedirectingRef = useRef(false)

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
    }
  }, [user?.id, fetchProfile])

  // Initialize auth state - runs once on mount
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
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

      if (currentUser) {
        const userProfile = await fetchProfile(currentUser.id)
        if (mounted) {
          setProfile(userProfile)
        }
      } else {
        if (mounted) {
          setProfile(null)
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

  // Handle navigation - simplified and debounced
  useEffect(() => {
    if (!initialized || loading || isRedirectingRef.current) {
      return
    }

    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Debounce redirects to prevent loops
    redirectTimeoutRef.current = setTimeout(() => {
      const isPublicPath = publicPaths.includes(pathname)
      const isProfileCompletePage = pathname === profileCompletionPath

      // No user - redirect to login
      if (!user) {
        if (!isPublicPath && lastRedirectRef.current !== "/login") {
          lastRedirectRef.current = "/login"
          isRedirectingRef.current = true
          router.replace("/login")
          setTimeout(() => {
            isRedirectingRef.current = false
          }, 1000)
        }
        return
      }

      // User exists but no profile yet - wait
      if (!profile) {
        return
      }

      // User and profile exist
      const isProfileComplete = profile.is_profile_complete === true

      if (isProfileComplete) {
        // Profile complete - redirect away from auth/complete pages
        if ((isPublicPath || isProfileCompletePage) && lastRedirectRef.current !== "/") {
          const dashboardPath = getDashboardPath(profile.user_type)
          lastRedirectRef.current = dashboardPath
          isRedirectingRef.current = true
          router.replace(dashboardPath)
          setTimeout(() => {
            isRedirectingRef.current = false
          }, 1000)
        }
      } else {
        // Profile incomplete - redirect to complete page
        if (!isProfileCompletePage && !isPublicPath && lastRedirectRef.current !== profileCompletionPath) {
          lastRedirectRef.current = profileCompletionPath
          isRedirectingRef.current = true
          router.replace(profileCompletionPath)
          setTimeout(() => {
            isRedirectingRef.current = false
          }, 1000)
        }
      }
    }, 100) // 100ms debounce

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [initialized, loading, user, profile, pathname, router])

  const getDashboardPath = (userType?: Profile["user_type"]) => {
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

      // Reset refs
      lastRedirectRef.current = null
      isRedirectingRef.current = false
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

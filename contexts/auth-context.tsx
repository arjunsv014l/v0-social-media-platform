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

// Check if user needs profile completion
const needsProfileCompletion = (profile: Profile | null): boolean => {
  if (!profile) return false
  return profile.is_profile_complete !== true
}

// Check if current path is valid for user type
const isValidPathForUser = (pathname: string, userType: Profile["user_type"]): boolean => {
  const dashboardPath = getDashboardPath(userType)
  const basePath = pathname.split("/")[1] || ""
  const expectedBase = dashboardPath.split("/")[1] || ""

  // Root path is valid for students
  if (userType === "student" && pathname === "/") return true

  // Check if user is on their correct dashboard area
  if (expectedBase && basePath !== expectedBase && pathname !== "/" && !publicPaths.includes(pathname)) {
    return false
  }

  return true
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  // Refs to prevent infinite redirects
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastRedirectRef = useRef<string | null>(null)
  const isRedirectingRef = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId)
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }

      console.log(
        "[AuthContext] Profile fetched:",
        profileData
          ? {
              user_type: profileData.user_type,
              is_profile_complete: profileData.is_profile_complete,
            }
          : null,
      )

      return profileData as Profile | null
    } catch (error) {
      console.error("[AuthContext] Exception in fetchProfile:", error)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      console.log("[AuthContext] Refreshing profile...")
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
      return updatedProfile
    }
    return null
  }, [user?.id, fetchProfile])

  // Perform redirect with safeguards
  const performRedirect = useCallback(
    (path: string, reason: string) => {
      if (isRedirectingRef.current || lastRedirectRef.current === path || pathname === path) {
        console.log(
          `[AuthContext] Redirect to ${path} skipped - ${isRedirectingRef.current ? "in progress" : "same path"}`,
        )
        return
      }

      console.log(`[AuthContext] Redirecting to ${path} - ${reason}`)
      isRedirectingRef.current = true
      lastRedirectRef.current = path

      router.replace(path)

      // Reset redirect flag after delay
      setTimeout(() => {
        isRedirectingRef.current = false
      }, 1500)
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
          // Clear redirect tracking on logout
          lastRedirectRef.current = null
          isRedirectingRef.current = false
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

  // Handle redirections
  useEffect(() => {
    if (!initialized || loading || isRedirectingRef.current) {
      return
    }

    // Clear any existing redirect timeout
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }

    // Debounce redirects
    redirectTimeoutRef.current = setTimeout(() => {
      const isPublicPath = publicPaths.includes(pathname)
      const isProfileCompletePage = pathname === profileCompletionPath

      console.log("[AuthContext] Evaluating redirections:", {
        pathname,
        user: !!user,
        profile: profile ? { type: profile.user_type, complete: profile.is_profile_complete } : null,
        isPublicPath,
        isProfileCompletePage,
      })

      // No user - redirect to login unless on public pages
      if (!user) {
        if (!isPublicPath) {
          performRedirect("/login", "No user, redirecting to login")
        }
        return
      }

      // User exists but no profile - wait for profile to load
      if (!profile) {
        console.log("[AuthContext] User exists but profile not loaded, waiting...")
        return
      }

      // User and profile exist - handle redirections based on profile state
      const needsCompletion = needsProfileCompletion(profile)
      const dashboardPath = getDashboardPath(profile.user_type)
      const isValidPath = isValidPathForUser(pathname, profile.user_type)

      if (needsCompletion) {
        // Profile incomplete - redirect to completion page
        if (!isProfileCompletePage && !isPublicPath) {
          performRedirect(profileCompletionPath, "Profile incomplete, redirecting to completion")
        }
      } else {
        // Profile complete - handle various redirection scenarios
        if (isPublicPath || isProfileCompletePage) {
          // Redirect away from auth/completion pages to dashboard
          performRedirect(dashboardPath, "Profile complete, redirecting to dashboard")
        } else if (!isValidPath) {
          // User on wrong dashboard type - redirect to correct one
          performRedirect(dashboardPath, `Wrong dashboard type, redirecting to ${profile.user_type} dashboard`)
        }
      }
    }, 150) // 150ms debounce

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [initialized, loading, user, profile, pathname, performRedirect])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("[AuthContext] Attempting sign in...")
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Don't set loading to false here - let the auth state change handle it
      console.log("[AuthContext] Sign in successful")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true)
    try {
      console.log("[AuthContext] Attempting sign up...")
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

      // Create initial profile
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
        }),
        ...(userData.userType === "corporate" && {
          company: userData.company,
          industry: userData.industry,
          company_size: userData.companySize,
        }),
      }

      const { error: profileError } = await supabase.from("profiles").insert(profileToInsert as Profile)
      if (profileError) throw profileError

      console.log("[AuthContext] Sign up successful")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log("[AuthContext] Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Reset redirect tracking
      lastRedirectRef.current = null
      isRedirectingRef.current = false

      console.log("[AuthContext] Sign out successful")
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

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
  const isProcessingAuthRef = useRef(false)

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
        id: profileData.id,
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
        console.log(`[AuthContext] Skipping redirect to ${path} - already there or recently redirected`)
        return
      }

      console.log(`[AuthContext] Redirecting to ${path} - ${reason}`)
      lastRedirectRef.current = path

      // Use replace to avoid adding to history
      router.replace(path)

      // Reset redirect tracking after delay
      setTimeout(() => {
        lastRedirectRef.current = null
      }, 2000)
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
        console.log("[AuthContext] Current session user:", currentUser?.id || "none")

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
      if (!mounted || isProcessingAuthRef.current) return

      console.log("[AuthContext] Auth state changed:", event, session?.user?.id || "no user")

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // For sign up events, wait a bit for profile creation
        if (event === "SIGNED_UP") {
          console.log("[AuthContext] New user signed up, waiting for profile...")
          // Wait for profile creation with retries
          let retries = 0
          const maxRetries = 10
          let userProfile = null

          while (retries < maxRetries && !userProfile && mounted) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            userProfile = await fetchProfile(currentUser.id)
            retries++
            console.log(`[AuthContext] Profile fetch attempt ${retries}:`, userProfile ? "found" : "not found")
          }

          if (mounted) {
            setProfile(userProfile)
          }
        } else if (event === "SIGNED_IN") {
          console.log("[AuthContext] User signed in, fetching profile...")
          const userProfile = await fetchProfile(currentUser.id)
          if (mounted) {
            setProfile(userProfile)
          }
        }
      } else {
        if (mounted) {
          setProfile(null)
          lastRedirectRef.current = null
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Handle redirections based on auth state
  useEffect(() => {
    if (!initialized || loading || isProcessingAuthRef.current) {
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
    })

    // No user - redirect to login unless on public pages
    if (!user) {
      if (!isPublicPath) {
        performRedirect("/login", "No user authenticated")
      }
      return
    }

    // User exists but no profile - wait a bit more or redirect to completion
    if (!profile) {
      console.log("[AuthContext] User exists but no profile found")
      // If we're not on the profile completion page, redirect there
      if (!isProfileCompletePage && !isPublicPath) {
        performRedirect(profileCompletionPath, "No profile found")
      }
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
      // Profile complete - redirect away from auth/completion pages to dashboard
      if (isPublicPath || isProfileCompletePage) {
        performRedirect(dashboardPath, "Profile complete, going to dashboard")
      }
    }
  }, [initialized, loading, user, profile, pathname, performRedirect])

  const signIn = async (email: string, password: string) => {
    if (isProcessingAuthRef.current) return

    isProcessingAuthRef.current = true
    setLoading(true)

    try {
      console.log("[AuthContext] Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("[AuthContext] Sign in error:", error)
        throw error
      }

      console.log("[AuthContext] Sign in successful for user:", data.user?.id)

      // Don't set loading to false here - let the auth state change handle it
    } catch (error) {
      console.error("[AuthContext] Sign in failed:", error)
      setLoading(false)
      isProcessingAuthRef.current = false
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    if (isProcessingAuthRef.current) return

    isProcessingAuthRef.current = true
    setLoading(true)

    try {
      console.log("[AuthContext] Attempting sign up for:", email, "as", userData.userType)

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
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

      // Step 2: Create profile immediately
      const profileData: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        username:
          userData.username ||
          `${userData.firstName.toLowerCase()}${userData.lastName.toLowerCase()}${Math.random().toString(36).substring(2, 5)}`,
        user_type: userData.userType,
        is_profile_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add user-type specific fields
      if (userData.userType === "student") {
        Object.assign(profileData, {
          university: userData.university,
          major: userData.major,
          graduation_year: userData.graduationYear,
          student_id_number: userData.studentId,
        })
      } else if (userData.userType === "professional") {
        Object.assign(profileData, {
          company: userData.company,
          job_title: userData.jobTitle,
          industry: userData.industry,
          linkedin_profile: userData.linkedinUrl,
        })
      } else if (userData.userType === "corporate") {
        Object.assign(profileData, {
          organization_name: userData.companyName,
          industry: userData.industry,
          organization_type: "corporate",
          contact_email: email,
        })
      }

      console.log("[AuthContext] Creating profile with data:", profileData)

      const { error: profileError } = await supabase.from("profiles").insert(profileData as Profile)

      if (profileError) {
        console.error("[AuthContext] Profile creation error:", profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log("[AuthContext] Profile created successfully")
      console.log("[AuthContext] Sign up complete - waiting for auth state change...")

      // The auth state change will handle the rest
    } catch (error) {
      console.error("[AuthContext] Sign up error:", error)
      setLoading(false)
      isProcessingAuthRef.current = false
      throw error
    } finally {
      // Reset processing flag after a delay to allow auth state change
      setTimeout(() => {
        isProcessingAuthRef.current = false
      }, 2000)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log("[AuthContext] Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear state
      setUser(null)
      setProfile(null)
      lastRedirectRef.current = null
      isProcessingAuthRef.current = false

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

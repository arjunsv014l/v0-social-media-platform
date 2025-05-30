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
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Use refs to prevent unnecessary redirections
  const lastRedirectPath = useRef<string | null>(null)
  const redirectInProgress = useRef(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log("[AuthContext] fetchProfile for user ID:", userId)
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error && error.code !== "PGRST116") {
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }
      console.log(
        "[AuthContext] Profile data fetched:",
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
      console.log("[AuthContext] refreshProfile for user:", user.id)
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
    }
  }, [user?.id, fetchProfile])

  const getDashboardPath = useCallback((userType?: Profile["user_type"]) => {
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
  }, [])

  const performRedirect = useCallback(
    (path: string, reason: string) => {
      if (redirectInProgress.current || lastRedirectPath.current === path) {
        console.log(`[AuthContext] Redirect to ${path} skipped - already in progress or same path`)
        return
      }

      console.log(`[AuthContext] Redirecting to ${path} - ${reason}`)
      redirectInProgress.current = true
      lastRedirectPath.current = path

      router.replace(path)

      // Reset redirect flag after a short delay
      setTimeout(() => {
        redirectInProgress.current = false
      }, 1000)
    },
    [router],
  )

  // Initialize auth state
  useEffect(() => {
    console.log("[AuthContext] Initializing auth state listener.")
    setLoading(true)

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const activeUser = session?.user ?? null
        setUser(activeUser)
        console.log("[AuthContext] Initial session user:", activeUser?.id)

        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("[AuthContext] Error in initial auth setup:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
        console.log("[AuthContext] Initial auth check complete")
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed. Event:", event, "Session User:", session?.user?.id)

      const activeUser = session?.user ?? null
      setUser(activeUser)

      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setAuthChecked(true)
    })

    return () => {
      console.log("[AuthContext] Unsubscribing auth listener.")
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Handle redirections - simplified and more robust
  useEffect(() => {
    if (loading || !authChecked || redirectInProgress.current) {
      console.log("[AuthContext] Redirection skipped - loading, not checked, or redirect in progress")
      return
    }

    const isAuthPage = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    console.log("[AuthContext] Evaluating redirection:", {
      pathname,
      user: !!user,
      profile: !!profile,
      userType: profile?.user_type,
      isProfileComplete: profile?.is_profile_complete,
      isAuthPage,
      isProfileCompletePage,
    })

    if (!user) {
      // No user - redirect to login unless already on auth pages
      if (!isAuthPage) {
        performRedirect("/login", "No user, redirecting to login")
      }
      return
    }

    // User is logged in
    if (!profile) {
      // User exists but no profile - this shouldn't happen normally
      // Let the profile complete page handle this case
      console.warn("[AuthContext] User exists but no profile found")
      return
    }

    // User and profile exist
    const isProfileComplete = profile.is_profile_complete === true
    const dashboardPath = getDashboardPath(profile.user_type)

    if (isProfileComplete) {
      // Profile is complete - redirect away from auth/complete pages
      if (isAuthPage || isProfileCompletePage) {
        performRedirect(dashboardPath, "Profile complete, redirecting to dashboard")
      }
    } else {
      // Profile is incomplete - redirect to complete page unless already there
      if (!isProfileCompletePage && !isAuthPage) {
        performRedirect(profileCompletionPath, "Profile incomplete, redirecting to complete page")
      }
    }
  }, [user, profile, loading, authChecked, pathname, getDashboardPath, performRedirect])

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] Attempting sign in for:", email)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      console.log("[AuthContext] Sign in successful")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("[AuthContext] Attempting sign up for:", email)
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
      if (!authData.user) throw new Error("Sign up failed, user not created.")

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

      console.log("[AuthContext] Sign up and initial profile creation successful")
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    console.log("[AuthContext] Attempting sign out")
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Reset redirect tracking
      lastRedirectPath.current = null
      redirectInProgress.current = false

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

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
    console.log("[AuthContext] fetchProfile for user ID:", userId)
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is not an error for a new user
        console.error("[AuthContext] Error fetching profile:", error)
        return null
      }
      console.log(
        "[AuthContext] Profile data fetched:",
        profileData ? { user_type: profileData.user_type, is_profile_complete: profileData.is_profile_complete } : null,
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
      setLoading(true) // Indicate loading during refresh
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
      setLoading(false)
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

  useEffect(() => {
    console.log("[AuthContext] Initializing auth state listener.")
    setLoading(true)
    const fetchUserAndProfile = async () => {
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
        console.error("[AuthContext] Error in initial fetchUserAndProfile:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
        console.log("[AuthContext] Initial auth check complete. AuthChecked: true, Loading: false")
      }
    }
    fetchUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] Auth state changed. Event:", event, "Session User:", session?.user?.id)
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
      setAuthChecked(true) // Ensure authChecked remains true
    })
    return () => {
      console.log("[AuthContext] Unsubscribing auth listener.")
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  useEffect(() => {
    console.log(
      "[AuthContext] Redirection useEffect. Path:",
      pathname,
      "AuthLoading:",
      loading,
      "AuthChecked:",
      authChecked,
      "User:",
      !!user,
      "Profile:",
      profile ? { type: profile.user_type, complete: profile.is_profile_complete } : null,
    )

    if (loading || !authChecked) {
      console.log("[AuthContext] Redirection skipped: loading or auth not checked.")
      return
    }

    const isAuthPage = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    if (user) {
      // User is logged in
      if (profile) {
        // Profile data is available
        if (profile.is_profile_complete === false) {
          if (!isProfileCompletePage) {
            console.log(
              "[AuthContext] Profile incomplete, NOT on complete page. Redirecting to:",
              profileCompletionPath,
            )
            router.push(profileCompletionPath)
          } else {
            console.log("[AuthContext] Profile incomplete, ALREADY on complete page. No redirect from AuthContext.")
          }
        } else if (profile.is_profile_complete === true) {
          const dashboardPath = getDashboardPath(profile.user_type)
          if (isAuthPage || isProfileCompletePage) {
            console.log(
              "[AuthContext] Profile complete, on auth/complete page. Redirecting to dashboard:",
              dashboardPath,
            )
            router.push(dashboardPath)
          } else {
            // Optional: Redirect if on the wrong dashboard type (already handled this logic)
            const currentBase = pathname.split("/")[1] || ""
            const targetBase = dashboardPath.split("/")[1] || ""
            if (targetBase && currentBase !== targetBase && dashboardPath !== "/" && !pathname.startsWith("/api")) {
              console.log(`[AuthContext] User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
              router.push(dashboardPath)
            } else {
              console.log("[AuthContext] Profile complete, on correct page or dashboard. No redirect from AuthContext.")
            }
          }
        } else {
          console.warn(
            "[AuthContext] Profile.is_profile_complete is undefined/null. Treating as incomplete. User ID:",
            user.id,
          )
          if (!isProfileCompletePage && !isAuthPage) {
            router.push(profileCompletionPath)
          }
        }
      } else {
        // User is logged in, but profile is null (and AuthContext is not 'loading')
        // This means profile fetch might have failed or is delayed.
        // Or, for a new user, the profile created by signUp hasn't been fetched yet.
        // The /profile/complete page should show its own loading state until profile is available.
        console.warn(
          "[AuthContext] User logged in, but profile is null (and AuthContext not loading). Waiting for profile data.",
        )
      }
    } else {
      // No user (logged out)
      if (!isAuthPage && !isProfileCompletePage) {
        console.log("[AuthContext] No user, NOT on public/complete page. Redirecting to /login")
        router.push("/login")
      } else {
        console.log("[AuthContext] No user, on public/complete page. No redirect from AuthContext.")
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
        options: { data: { full_name: `${userData.firstName} ${userData.lastName}`, user_type: userData.userType } },
      })
      if (authError) throw authError
      if (!authData.user) throw new Error("Sign up failed, user not created.")

      const profileToInsert: Partial<Profile> & { id: string; user_type: Profile["user_type"] } = {
        id: authData.user.id,
        full_name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username || email.split("@")[0] + Math.random().toString(36).substring(2, 7),
        user_type: userData.userType,
        is_profile_complete: false, // CRUCIAL
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
      console.log("AuthContext: Sign up and initial profile creation successful.")
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
      console.log("AuthContext: Supabase sign out command successful.")
    } catch (error) {
      console.error("AuthContext: Error during signOut initiation:", error)
      throw error
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

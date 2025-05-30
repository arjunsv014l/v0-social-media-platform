"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/supabase/types" // Ensure this type is comprehensive

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean // True while initial auth check or during auth operations
  authChecked: boolean // True once initial auth check is complete
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
  const [loading, setLoading] = useState(true) // Start true for initial load
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log("AuthContext: Fetching profile for user ID:", userId)
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine if profile not yet created
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

  const getDashboardPath = useCallback((userType?: string) => {
    switch (userType) {
      case "student":
        return "/"
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      default:
        console.warn("AuthContext: Unknown user type for dashboard path:", userType)
        return "/" // Default to student dashboard or a generic landing
    }
  }, [])

  // Effect for initial auth check and subscription
  useEffect(() => {
    console.log("AuthContext: Initializing auth state listener.")
    setLoading(true)

    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("AuthContext: Error getting session:", sessionError)
        }
        const activeUser = session?.user ?? null
        setUser(activeUser)
        console.log("AuthContext: Initial session user:", activeUser?.id)

        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("AuthContext: Error in initial fetchUserAndProfile:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
        console.log("AuthContext: Initial auth check complete. AuthChecked:", true, "Loading:", false)
      }
    }

    fetchUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed. Event:", event, "Session User:", session?.user?.id)
      setLoading(true) // Set loading true during state change processing
      const activeUser = session?.user ?? null
      setUser(activeUser)

      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false) // Done processing state change
      setAuthChecked(true) // Ensure authChecked is true after any state change
      console.log("AuthContext: Auth state change processed. Loading:", false)
    })
    return () => {
      console.log("AuthContext: Unsubscribing auth listener.")
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Effect for handling redirection
  useEffect(() => {
    if (loading || !authChecked) {
      console.log("AuthContext: Redirect check skipped - loading or auth not checked.", { loading, authChecked })
      return
    }

    const isAuthPage = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    console.log("AuthContext: Evaluating redirection...", {
      pathname,
      user: !!user,
      profile: !!profile,
      userType: profile?.user_type,
      isProfileComplete: profile?.is_profile_complete,
      isAuthPage,
      isProfileCompletePage,
    })

    if (user) {
      // User is logged in
      if (profile) {
        // Profile data exists
        if (!profile.is_profile_complete) {
          if (!isProfileCompletePage) {
            console.log("AuthContext: User logged in, profile incomplete. Redirecting to:", profileCompletionPath)
            router.push(profileCompletionPath)
          } else {
            console.log("AuthContext: User on profile completion page.")
          }
        } else {
          // Profile is complete
          const dashboardPath = getDashboardPath(profile.user_type)
          if (isAuthPage || isProfileCompletePage) {
            console.log(
              "AuthContext: User logged in, profile complete. On auth/complete page. Redirecting to dashboard:",
              dashboardPath,
            )
            router.push(dashboardPath)
          } else {
            // Optional: If user is on a path not matching their dashboard, redirect.
            // Check if current path is already the target dashboard path to avoid loop
            if (pathname !== dashboardPath && !pathname.startsWith("/api")) {
              // Avoid redirecting API routes
              // A more specific check might be needed if dashboards have sub-routes
              // For now, if not on an auth page, complete page, or their dashboard, redirect.
              // This can be aggressive. Consider if user should be allowed on other pages.
              // Example: if student is on /professional/dashboard, redirect to /
              const currentBaseDashboard = pathname.split("/")[1] // e.g. "professional" from "/professional/dashboard"
              const targetBaseDashboard = dashboardPath.split("/")[1]
              if (dashboardPath !== "/" && currentBaseDashboard !== targetBaseDashboard && profile.user_type) {
                console.log(`AuthContext: User on wrong dashboard type (${pathname}), redirecting to ${dashboardPath}`)
                router.push(dashboardPath)
              } else {
                console.log(
                  "AuthContext: User logged in, profile complete. On a valid page or their dashboard:",
                  dashboardPath,
                )
              }
            }
          }
        }
      } else {
        // User is logged in, but profile is null (still fetching or error)
        // This case should ideally be short-lived or indicate an issue with profile creation/fetching.
        // If stuck here, it means profile isn't loading after login.
        console.log(
          "AuthContext: User logged in, but profile is null. Waiting for profile or redirecting to complete if stuck.",
        )
        // Potentially redirect to profile completion if this state persists,
        // or if it's known that sign-up implies profile should exist soon.
        // For now, rely on onAuthStateChange to set profile. If it doesn't, profile completion redirect will trigger.
        if (!isProfileCompletePage && !isAuthPage) {
          // If profile remains null after a short delay post-login, this might be a fallback.
          // However, the onAuthStateChange should handle setting the profile.
          // This could indicate an issue if profile is consistently null after login.
        }
      }
    } else {
      // No user (logged out)
      if (!isAuthPage && !isProfileCompletePage) {
        // Not on a public page
        console.log("AuthContext: No user. Not on public page. Redirecting to /login")
        router.push("/login")
      } else {
        console.log("AuthContext: No user. On a public page.")
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
      // onAuthStateChange will handle setting user and profile, then redirection effect will run
      console.log("AuthContext: Sign in successful via Supabase. Waiting for onAuthStateChange.")
    } catch (error) {
      setLoading(false)
      throw error
    }
    // setLoading(false) will be handled by onAuthStateChange or its finally block
  }

  const signUp = async (email: string, password: string, userData: any) => {
    console.log("AuthContext: Attempting sign up for:", email, "User Data:", userData)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // This data is for the auth.users table, not profiles directly at this stage
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: email.split("@")[0], // Example default
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userData.userType,
            // Supabase Auth options.data is limited.
            // Profile-specific data (university, major, etc.) will be written to 'profiles' table,
            // often triggered by a DB function on new user creation or explicitly after signup.
            // For now, we ensure `is_profile_complete` is part of the user_metadata or handled post-signup.
            // The important part is that `is_profile_complete` should be `false` initially.
            // This is usually set in the profiles table, not directly in auth.users metadata via options.data.
            // The `profiles` table entry is typically created via a trigger or in the `complete profile` step.
            // We'll assume `is_profile_complete` is handled in the `profiles` table.
          },
        },
      })

      if (error) {
        console.error("AuthContext: Sign up error:", error)
        throw error
      }

      // After successful Supabase signUp, the user object in `session` might not immediately have all custom metadata.
      // The `onAuthStateChange` will fire. The profile fetching logic there is crucial.
      // We also need to ensure the `profiles` table entry is created with `is_profile_complete: false`
      // and all the `userData` (university, major, company_name etc.)
      // This is typically done by:
      // 1. A DB trigger on `auth.users` insertion that populates `public.profiles`.
      // 2. Or, an explicit insert into `public.profiles` here or on the profile completion page.

      // For simplicity in this context, let's assume a trigger handles initial profile row creation
      // or the profile completion page handles creating/updating it.
      // The key is that `fetchProfile` after `onAuthStateChange` should find a profile
      // (even if minimal) with `is_profile_complete: false`.

      console.log(
        "AuthContext: Sign up successful via Supabase. User:",
        data.user?.id,
        "Waiting for onAuthStateChange.",
      )
      // The redirection to /profile/complete will be handled by the redirection useEffect
      // once the user state and profile (with is_profile_complete: false) are set.
    } catch (error) {
      setLoading(false)
      throw error
    }
    // setLoading(false) will be handled by onAuthStateChange or its finally block
  }

  const signOut = async () => {
    console.log("AuthContext: Signing out.")
    setLoading(true)
    try {
      await supabase.auth.signOut()
      // onAuthStateChange will set user and profile to null
    } catch (error) {
      console.error("AuthContext: Sign out error:", error)
      setLoading(false) // Ensure loading is false on error
    }
    // setLoading(false) handled by onAuthStateChange
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

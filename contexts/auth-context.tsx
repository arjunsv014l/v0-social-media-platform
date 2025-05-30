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
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Define paths that don't require profile completion
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
    try {
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        return null
      }
      return profileData as Profile | null
    } catch (error) {
      console.error("Error in fetchProfile:", error)
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

  const getDashboardPath = useCallback((userType: string) => {
    switch (userType) {
      case "student":
        return "/"
      case "professional":
        return "/professional/dashboard"
      case "corporate":
        return "/corporate/dashboard"
      default:
        return "/"
    }
  }, [])

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const activeUser = session?.user ?? null
        setUser(activeUser)

        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error fetching user and profile:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
      }
    }

    fetchUserAndProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setLoading(true)
        const activeUser = session?.user ?? null
        setUser(activeUser)

        if (activeUser) {
          const userProfile = await fetchProfile(activeUser.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setLoading(false)
        setAuthChecked(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Effect for handling redirection based on auth state, profile completion, and user type
  useEffect(() => {
    if (loading || !authChecked) {
      console.log("AuthContext: Still loading or auth not checked, skipping redirect.")
      return
    }

    const isAuthPage = publicPaths.includes(pathname)
    const isProfileCompletePage = pathname === profileCompletionPath

    console.log("AuthContext: Redirect check", {
      user: !!user,
      profile: !!profile,
      userType: profile?.user_type,
      isProfileComplete: profile?.is_profile_complete,
      currentPath: pathname,
      isAuthPage,
      isProfileCompletePage,
    })

    if (user && profile) {
      // User is logged in and profile is available
      if (!profile.is_profile_complete) {
        if (!isProfileCompletePage) {
          console.log("AuthContext: Profile incomplete, redirecting to", profileCompletionPath)
          router.push(profileCompletionPath)
        }
      } else {
        // Profile is complete
        const dashboardPath = getDashboardPath(profile.user_type || "student")
        if (isAuthPage || isProfileCompletePage) {
          console.log("AuthContext: Profile complete, on auth/complete page, redirecting to dashboard:", dashboardPath)
          router.push(dashboardPath)
        } else {
          // Optional: If user is on a path not matching their dashboard, redirect.
          // This can be aggressive, so consider if it's needed.
          // For now, let's assume if they are on other valid pages, they can stay.
          // Example: if (pathname !== dashboardPath && !pathname.startsWith(dashboardPath)) {
          //   router.push(dashboardPath);
          // }
          console.log("AuthContext: Profile complete, user on a valid page or their dashboard.")
        }
      }
    } else if (!user) {
      // User is not logged in
      if (!isAuthPage && !isProfileCompletePage) {
        // Allow access to profile/complete if a direct link is somehow accessed without auth
        console.log("AuthContext: No user, not on auth page, redirecting to /login")
        router.push("/login")
      }
    }
  }, [user, profile, loading, authChecked, pathname, router, getDashboardPath])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      console.log("Sign in successful, waiting for profile fetch and redirect")
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            username: email.split("@")[0],
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userData.userType,
            major: userData.major,
            graduationYear: userData.graduationYear,
            university: userData.university,
            job_title: userData.jobTitle,
            company_name: userData.companyName || userData.company,
            company_size: userData.companySize,
            industry: userData.industry,
            years_experience: userData.yearsExperience,
            company_website: userData.companyWebsite,
            linkedin_url: userData.linkedinUrl,
            skills: userData.skills,
            is_profile_complete: false,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        throw error
      }

      console.log("Sign up successful, waiting for profile creation and redirect")
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  console.log("AuthContext Provider rendering with state:", { user, profile, loading, authChecked })
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

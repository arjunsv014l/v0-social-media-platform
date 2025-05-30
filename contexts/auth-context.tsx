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

  // Effect for handling redirection based on profile completion
  useEffect(() => {
    // Only proceed if we're not loading and auth has been checked
    if (loading || !authChecked) return

    // If user is not authenticated, don't redirect
    if (!user) return

    // If we don't have profile data yet, wait for it
    if (!profile) return

    console.log("Auth redirect check:", {
      user: !!user,
      profile: !!profile,
      isProfileComplete: profile?.is_profile_complete,
      currentPath: pathname,
    })

    // If profile is not complete and user is not on public paths or profile completion path
    if (!profile.is_profile_complete && !publicPaths.includes(pathname) && pathname !== profileCompletionPath) {
      console.log("Redirecting to profile completion")
      router.push(profileCompletionPath)
    }
    // If profile is complete and user is on profile completion path, redirect to dashboard
    else if (profile.is_profile_complete && pathname === profileCompletionPath) {
      console.log("Redirecting to dashboard")
      router.push("/")
    }
    // If profile is complete and user is on login/signup, redirect to dashboard
    else if (profile.is_profile_complete && publicPaths.includes(pathname)) {
      console.log("Redirecting authenticated user to dashboard")
      router.push("/")
    }
  }, [user, profile, loading, authChecked, pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Don't manually redirect here - let the useEffect handle it after profile is fetched
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
            major: userData.major,
            graduationYear: userData.graduationYear,
            university: userData.university,
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

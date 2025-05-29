"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      }

      setLoading(false)
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    router.push("/")
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: email.split("@")[0], // Default username, can be updated later
          full_name: `${userData.firstName} ${userData.lastName}`, // For direct use if needed, though trigger constructs it
          major: userData.major,
          graduationYear: userData.graduationYear,
          university: userData.university,
          // Add any other fields from your signup form that should go into raw_user_meta_data
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      throw error
    }

    // The trigger 'handle_new_user' in Supabase will now automatically create the profile.
    // So, we no longer need to manually insert into the 'profiles' table here.

    // Optional: Fetch the newly created profile if needed immediately on the client,
    // though onAuthStateChange should also update it.
    if (data.user) {
      let attempts = 0
      let profileData = null
      let lastProfileError = null

      while (attempts < 3 && !profileData) {
        if (attempts > 0) {
          // Wait for a short period before retrying
          await new Promise((resolve) => setTimeout(resolve, 500 * attempts))
        }
        const { data: fetchedProfile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileFetchError && profileFetchError.code !== "PGRST116") {
          // PGRST116: "The result contains 0 rows"
          // If it's an error other than "no rows found", log it and stop retrying.
          console.error(`Error fetching profile (attempt ${attempts + 1}):`, profileFetchError)
          lastProfileError = profileFetchError
          break
        }

        if (fetchedProfile) {
          profileData = fetchedProfile
        }
        lastProfileError = profileFetchError // Store the last error, even if it's PGRST116
        attempts++
      }

      if (profileData) {
        setProfile(profileData)
      } else {
        console.warn(
          "Could not fetch profile immediately after sign up. Will rely on onAuthStateChange.",
          lastProfileError,
        )
        // Not throwing an error here as the user is signed up.
        // onAuthStateChange should eventually pick up the profile.
      }
    }

    router.push("/")
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

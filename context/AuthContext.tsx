"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { Profile } from "@/lib/supabase/types" // Assuming Profile type is defined here

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Error getting session:", sessionError)
        setLoading(false)
        return
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (currentSession?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
        } else {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", newSession.user.id)
          .single()
        if (profileError) {
          console.error("Error fetching profile on auth change:", profileError)
          setProfile(null)
        } else {
          setProfile(userProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false) // Ensure loading is set to false after auth state change
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setLoading(false)
  }

  return <AuthContext.Provider value={{ user, session, profile, loading, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

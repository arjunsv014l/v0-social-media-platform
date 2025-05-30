"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // For description
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function CorporateSignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "", // Representative's first name
    lastName: "", // Representative's last name
    email: "", // Representative's official email
    password: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    companyDescription: "",
  })
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const corporateData = {
      ...formData,
      userType: "corporate",
    }

    try {
      await signUp(formData.email, formData.password, corporateData, "corporate")
      toast({
        title: "Corporate Account Registered! 🏢",
        description: "Your corporate account application has been submitted. Redirecting...",
      })
      // Redirection handled by AuthContext
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register corporate account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium text-center">Representative Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName-corp">First Name *</Label>
          <Input
            id="firstName-corp"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            placeholder="HR"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName-corp">Last Name *</Label>
          <Input
            id="lastName-corp"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            placeholder="Manager"
            required
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-corp">Your Official Email *</Label>
        <Input
          id="email-corp"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="hr@company.com"
          required
          disabled={loading}
        />
      </div>

      <hr className="my-6" />
      <h3 className="text-lg font-medium text-center">Company Information</h3>
      <div className="space-y-2">
        <Label htmlFor="companyName-corp">Company Name *</Label>
        <Input
          id="companyName-corp"
          value={formData.companyName}
          onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
          placeholder="Innovatech Solutions Inc."
          required
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyWebsite-corp">Company Website</Label>
          <Input
            id="companyWebsite-corp"
            type="url"
            value={formData.companyWebsite}
            onChange={(e) => setFormData((prev) => ({ ...prev, companyWebsite: e.target.value }))}
            placeholder="https://innovatech.com"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry-corp">Industry</Label>
          <Input
            id="industry-corp"
            value={formData.industry}
            onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
            placeholder="e.g., Technology, Finance, Healthcare"
            disabled={loading}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyDescription-corp">Company Description</Label>
        <Textarea
          id="companyDescription-corp"
          value={formData.companyDescription}
          onChange={(e) => setFormData((prev) => ({ ...prev, companyDescription: e.target.value }))}
          placeholder="Briefly describe your company and what it does."
          disabled={loading}
        />
      </div>

      <hr className="my-6" />
      <div className="space-y-2">
        <Label htmlFor="password-corp">Create Password for Your Account *</Label>
        <div className="relative">
          <Input
            id="password-corp"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Create a strong password"
            required
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-600 hover:to-sky-700"
        disabled={loading}
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registering Corporate Account...
          </>
        ) : (
          "Register Corporate Account"
        )}
      </Button>
    </form>
  )
}

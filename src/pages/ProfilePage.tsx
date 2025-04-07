"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ProfileHeader } from "../components/profile/profile-header"
import { ProfileTabs } from "../components/profile/profile-tabs"
import { api } from "../lib/api"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "../components/ui/use-toast"
import type { User } from "../lib/types"

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [user, setUser] = useState<
    | (User & {
        _count: {
          followers: number
          following: number
          posts: number
        }
      })
    | null
  >(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${username}`)
        setUser(response.data)
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast({
            variant: "destructive",
            title: "User not found",
            description: `The user @${username} does not exist`,
          })
          navigate("/")
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load user profile",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchUser()
    }
  }, [username, navigate, toast])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user || !currentUser) {
    return null
  }

  return (
    <div className="py-6 max-w-4xl mx-auto px-4">
      <div className="facebook-card overflow-hidden mb-4">
        <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-200"></div>
        <ProfileHeader user={user} currentUser={currentUser} />
      </div>
      <ProfileTabs user={user} />
    </div>
  )
}


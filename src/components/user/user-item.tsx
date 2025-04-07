"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { api } from "../../lib/api"
import { useAuth } from "../../contexts/AuthContext"
import type { User } from "../../lib/types"
import { useToast } from "../ui/use-toast"
import { UserPlus, UserCheck } from "lucide-react"

interface UserItemProps {
  user: User
  isFollowing?: boolean
}

export function UserItem({ user, isFollowing = false }: UserItemProps) {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)

  if (!currentUser) {
    return null
  }

  const handleFollowToggle = async () => {
    if (isLoading || user.id === currentUser.id) return

    setIsLoading(true)

    try {
      if (following) {
        await api.delete(`/users/${user.id}/follow`)
      } else {
        await api.post(`/users/${user.id}/follow`)
      }

      setFollowing(!following)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to follow/unfollow user",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="facebook-card hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Link to={`/profile/${user.username}`}>
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${user.username}`} className="font-semibold hover:underline text-sm truncate block">
              {user.name}
            </Link>
            <Link to={`/profile/${user.username}`} className="text-xs text-muted-foreground hover:underline truncate block">
              @{user.username}
            </Link>
          </div>
          {currentUser.id !== user.id && (
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              variant={following ? "outline" : "default"}
              size="sm"
              className="ml-auto facebook-button"
            >
              {following ? (
                <>
                  <UserCheck className="h-4 w-4 mr-1.5" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { api } from "../../lib/api"
import type { User } from "../../lib/types"
import { useToast } from "../ui/use-toast"
import { UserPlus, UserCheck, MessageSquare } from "lucide-react"

interface ProfileHeaderProps {
  user: User & {
    _count: {
      followers: number
      following: number
      posts: number
    }
  }
  currentUser: User
}

export function ProfileHeader({ user, currentUser }: ProfileHeaderProps) {
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(
    user.followers?.some((follow) => follow.followerId === currentUser.id) || false,
  )
  const [followerCount, setFollowerCount] = useState(user._count.followers)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        await api.delete(`/users/${user.id}/follow`)
        setFollowerCount(followerCount - 1)
      } else {
        await api.post(`/users/${user.id}/follow`)
        setFollowerCount(followerCount + 1)
      }

      setIsFollowing(!isFollowing)
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
    <div className="relative px-6 pb-4">
      <Avatar className="h-32 w-32 absolute -top-16 left-6 border-4 border-white ring-2 ring-primary/10">
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback className="text-4xl">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between pt-16 md:pt-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
        </div>
        
        {currentUser.id !== user.id && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Message
            </Button>
            
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              className="facebook-button"
            >
              {isFollowing ? (
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
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t">
        <div className="text-center flex-1">
          <span className="block text-xl font-bold">{user._count.posts}</span>
          <span className="text-sm text-muted-foreground">Posts</span>
        </div>
        <div className="text-center flex-1">
          <span className="block text-xl font-bold">{followerCount}</span>
          <span className="text-sm text-muted-foreground">Followers</span>
        </div>
        <div className="text-center flex-1">
          <span className="block text-xl font-bold">{user._count.following}</span>
          <span className="text-sm text-muted-foreground">Following</span>
        </div>
      </div>
    </div>
  )
}


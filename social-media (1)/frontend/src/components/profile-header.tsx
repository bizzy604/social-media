"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client"
import { FOLLOW_USER, UNFOLLOW_USER } from "../graphql/mutations"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { useToast } from "./ui/use-toast"
import { useAuth } from "../contexts/auth-context"
import type { User } from "../types"

interface ProfileHeaderProps {
  user: User & {
    followersCount: number
    followingCount: number
    postsCount: number
    isFollowing: boolean
  }
  onFollowToggled?: () => void
}

export default function ProfileHeader({ user, onFollowToggled }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing)
  const [followersCount, setFollowersCount] = useState(user.followersCount)
  const { toast } = useToast()
  const { user: currentUser } = useAuth()

  const [followUser, { loading: followLoading }] = useMutation(FOLLOW_USER)
  const [unfollowUser, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER)

  const isLoading = followLoading || unfollowLoading
  const isCurrentUser = currentUser?.id === user.id

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId: user.id } })
        setIsFollowing(false)
        setFollowersCount(followersCount - 1)
      } else {
        await followUser({ variables: { userId: user.id } })
        setIsFollowing(true)
        setFollowersCount(followersCount + 1)
      }

      if (onFollowToggled) {
        onFollowToggled()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your action could not be processed. Please try again.",
      })
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="text-2xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              {!isCurrentUser && (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  className="md:ml-auto"
                  onClick={handleFollow}
                  disabled={isLoading}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>

            {user.bio && <p className="mb-4">{user.bio}</p>}

            <div className="flex gap-6">
              <div>
                <span className="font-semibold">{user.postsCount}</span>{" "}
                <span className="text-muted-foreground">{user.postsCount === 1 ? "Post" : "Posts"}</span>
              </div>
              <div>
                <span className="font-semibold">{followersCount}</span>{" "}
                <span className="text-muted-foreground">{followersCount === 1 ? "Follower" : "Followers"}</span>
              </div>
              <div>
                <span className="font-semibold">{user.followingCount}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { FOLLOW_USER, UNFOLLOW_USER } from "../graphql/mutations"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter } from "./ui/card"
import { useToast } from "./ui/use-toast"
import type { User } from "../types"

interface UserCardProps {
  user: User & {
    followersCount: number
    followingCount: number
    postsCount: number
    isFollowing?: boolean
  }
  onFollowToggled?: () => void
}

export default function UserCard({ user, onFollowToggled }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false)
  const { toast } = useToast()

  const [followUser, { loading: followLoading }] = useMutation(FOLLOW_USER)
  const [unfollowUser, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER)

  const isLoading = followLoading || unfollowLoading

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId: user.id } })
        setIsFollowing(false)
      } else {
        await followUser({ variables: { userId: user.id } })
        setIsFollowing(true)
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
        <div className="flex gap-4">
          <Link to={`/profile/${user.id}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex flex-col">
              <Link to={`/profile/${user.id}`} className="font-semibold hover:underline">
                {user.name}
              </Link>
              <span className="text-muted-foreground text-sm">@{user.username}</span>
            </div>
            {user.bio && <p className="mt-2 text-sm line-clamp-2">{user.bio}</p>}
            <div className="flex gap-4 mt-2 text-sm">
              <span>
                <span className="font-semibold">{user.postsCount}</span>{" "}
                <span className="text-muted-foreground">{user.postsCount === 1 ? "Post" : "Posts"}</span>
              </span>
              <span>
                <span className="font-semibold">{user.followersCount}</span>{" "}
                <span className="text-muted-foreground">{user.followersCount === 1 ? "Follower" : "Followers"}</span>
              </span>
              <span>
                <span className="font-semibold">{user.followingCount}</span>{" "}
                <span className="text-muted-foreground">Following</span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button
          variant={isFollowing ? "outline" : "default"}
          className="w-full"
          onClick={handleFollow}
          disabled={isLoading}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </CardFooter>
    </Card>
  )
}

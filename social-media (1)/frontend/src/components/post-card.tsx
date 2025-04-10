"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { useMutation } from "@apollo/client"
import { LIKE_POST, UNLIKE_POST } from "../graphql/mutations"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter } from "./ui/card"
import { Heart } from "lucide-react"
import { cn } from "../lib/utils"
import { useToast } from "./ui/use-toast"
import type { Post } from "../types"

interface PostCardProps {
  post: Post
  onLikeToggled?: () => void
}

export default function PostCard({ post, onLikeToggled }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const { toast } = useToast()

  const [likePost, { loading: likeLoading }] = useMutation(LIKE_POST)
  const [unlikePost, { loading: unlikeLoading }] = useMutation(UNLIKE_POST)

  const isLoading = likeLoading || unlikeLoading

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost({ variables: { postId: post.id } })
        setIsLiked(false)
        setLikeCount(likeCount - 1)
      } else {
        await likePost({ variables: { postId: post.id } })
        setIsLiked(true)
        setLikeCount(likeCount + 1)
      }

      if (onLikeToggled) {
        onLikeToggled()
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
        <div className="flex gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <Avatar>
              <AvatarImage src={post.author.image || ""} alt={post.author.name || "User"} />
              <AvatarFallback>{post.author.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/profile/${post.author.id}`} className="font-semibold hover:underline">
                {post.author.name}
              </Link>
              <span className="text-muted-foreground text-sm">@{post.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">
                {(() => {
                  try {
                    // Make sure post.createdAt is valid before formatting
                    if (!post.createdAt || isNaN(new Date(post.createdAt).getTime())) {
                      return 'recently';
                    }
                    return formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    });
                  } catch (error) {
                    console.error('Date formatting error:', error, post.createdAt);
                    return 'recently';
                  }
                })()}
              </span>
            </div>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLike} disabled={isLoading}>
            <Heart className={cn("w-5 h-5", isLiked ? "fill-red-500 text-red-500" : "")} />
            <span className="sr-only">{isLiked ? "Unlike" : "Like"}</span>
          </Button>
          <span className="text-sm">{likeCount}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

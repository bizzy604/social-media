"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { api } from "../../lib/api"
import type { Post, User } from "../../lib/types"
import { useToast } from "../ui/use-toast"

interface PostItemProps {
  post: Post
  currentUser: User
}

export function PostItem({ post, currentUser }: PostItemProps) {
  const [likes, setLikes] = useState(post.likes)
  const [isLiked, setIsLiked] = useState(post.likes.some((like) => like.userId === currentUser.id))
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLikeToggle = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        await api.delete(`/posts/${post.id}/like`)
        setLikes(likes.filter((like) => like.userId !== currentUser.id))
      } else {
        const response = await api.post(`/posts/${post.id}/like`)
        setLikes([...likes, response.data])
      }

      setIsLiked(!isLiked)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like/unlike post",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="facebook-card overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-3">
        <Link to={`/profile/${post.author.username}`}>
          <Avatar>
            <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col">
          <Link to={`/profile/${post.author.username}`} className="font-semibold hover:underline">
            {post.author.name}
          </Link>
          <div className="flex items-center text-xs text-muted-foreground">
            <Link to={`/profile/${post.author.username}`} className="hover:underline">
              @{post.author.username}
            </Link>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {post.authorId === currentUser.id && (
                <DropdownMenuItem>Delete post</DropdownMenuItem>
              )}
              <DropdownMenuItem>Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      
      {likes.length > 0 && (
        <div className="px-4 py-2 border-t border-b flex items-center text-sm text-muted-foreground">
          <Heart className="h-4 w-4 text-red-500 mr-1.5" />
          <span>{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
        </div>
      )}
      
      <CardFooter className="p-0">
        <div className="grid grid-cols-3 w-full divide-x border-t">
          <Button 
            variant="ghost" 
            className={`rounded-none h-10 facebook-button ${isLiked ? 'text-primary' : ''}`}
            onClick={handleLikeToggle} 
            disabled={isLoading}
          >
            <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-primary text-primary' : ''}`} />
            Like
          </Button>
          <Button variant="ghost" className="rounded-none h-10 facebook-button">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comment
          </Button>
          <Button variant="ghost" className="rounded-none h-10 facebook-button">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}


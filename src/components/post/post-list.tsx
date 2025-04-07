"use client"

import { useState, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { PostItem } from "./post-item"
import { api } from "../../lib/api"
import type { Post } from "../../lib/types"
import { useAuth } from "../../contexts/AuthContext"
import { useToast } from "../ui/use-toast"

interface PostListProps {
  initialPosts: Post[]
}

export function PostList({ initialPosts }: PostListProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length === 10)
  const observer = useRef<IntersectionObserver | null>(null)
  const { toast } = useToast()

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts()
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore],
  )

  const loadMorePosts = async () => {
    setIsLoading(true)

    try {
      const lastPostId = posts[posts.length - 1]?.id
      const response = await api.get(`/posts/feed?cursor=${lastPostId}`)
      const newPosts = response.data

      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts([...posts, ...newPosts])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load more posts",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-muted-foreground">
          No posts yet. Follow some users to see their posts in your feed!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div key={post.id} ref={index === posts.length - 1 ? lastPostElementRef : undefined}>
          <PostItem post={post} currentUser={user} />
        </div>
      ))}

      {hasMore && (
        <div className="flex items-center justify-center p-4">
          {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  )
}


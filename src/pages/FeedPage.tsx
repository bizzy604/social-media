"use client"

import { useState, useEffect } from "react"
import { PostForm } from "../components/post/post-form"
import { PostList } from "../components/post/post-list"
import { api } from "../lib/api"
import type { Post, User } from "../lib/types"
import { useToast } from "../components/ui/use-toast"
import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar"

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsResponse, suggestionsResponse] = await Promise.all([
          api.get("/posts/feed"),
          api.get("/users/suggestions"),
        ])

        setPosts(postsResponse.data)
        setSuggestions(suggestionsResponse.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load feed data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleNewPost = (post: Post) => {
    setPosts([post, ...posts])
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="max-w-2xl mx-auto space-y-4">
            <PostForm onPostCreated={handleNewPost} />
            
            {/* People you may know section (visible on mobile) */}
            <div className="lg:hidden">
              {suggestions.length > 0 && (
                <div className="app-card p-4 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg mb-4">People you may know</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.slice(0, 4).map((user) => (
                      <SuggestionCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <PostList initialPosts={posts} />
          </div>
        </div>
        
        {/* Sidebar - only visible on large screens */}
        <div className="hidden lg:block">
          {suggestions.length > 0 && (
            <div className="app-card p-4 rounded-lg shadow-sm sticky top-20">
              <h3 className="font-bold text-lg mb-4">People you may know</h3>
              <div className="space-y-3">
                {suggestions.slice(0, 6).map((user) => (
                  <SuggestionCard key={user.id} user={user} isCompact={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SuggestionCard({ user, isCompact = false }: { user: User, isCompact?: boolean }) {
  const [following, setFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      if (following) {
        await api.delete(`/users/${user.id}/follow`)
      } else {
        await api.post(`/users/${user.id}/follow`)
      }
      setFollowing(!following)
    } catch (error) {
      console.error("Failed to follow user:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className={`app-card ${isCompact ? 'p-2 flex items-center' : 'p-2 flex flex-col'} rounded-md`}>
      <Link to={`/profile/${user.username}`} className={isCompact ? 'mr-2' : 'mb-2'}>
        <Avatar className={isCompact ? 'h-10 w-10' : 'h-14 w-14 mx-auto'}>
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className={isCompact ? 'flex-1' : ''}>
        <Link to={`/profile/${user.username}`} className="font-semibold text-sm truncate hover:underline">
          {user.name}
        </Link>
        <Button
          onClick={handleFollow}
          disabled={isLoading}
          variant={following ? "outline" : "default"}
          size="sm"
          className={isCompact ? 'mt-0 ml-auto' : 'mt-2 w-full'}
        >
          {following ? "Following" : "Follow"}
        </Button>
      </div>
    </div>
  )
}


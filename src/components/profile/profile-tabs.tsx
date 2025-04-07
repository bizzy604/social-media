"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { PostList } from "../post/post-list"
import { UserList } from "../user/user-list"
import { api } from "../../lib/api"
import type { Post, User } from "../../lib/types"
import { useToast } from "../ui/use-toast"

interface ProfileTabsProps {
  user: User
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [_activeTab, setActiveTab] = useState("posts")
  const [loading, setLoading] = useState({
    posts: false,
    followers: false,
    following: false,
  })
  const { toast } = useToast()

  const handleTabChange = async (value: string) => {
    setActiveTab(value)

    if (value === "posts" && posts.length === 0 && !loading.posts) {
      setLoading((prev) => ({ ...prev, posts: true }))
      try {
        const response = await api.get(`/users/${user.id}/posts`)
        setPosts(response.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch posts",
        })
      } finally {
        setLoading((prev) => ({ ...prev, posts: false }))
      }
    }

    if (value === "followers" && followers.length === 0 && !loading.followers) {
      setLoading((prev) => ({ ...prev, followers: true }))
      try {
        const response = await api.get(`/users/${user.id}/followers`)
        setFollowers(response.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch followers",
        })
      } finally {
        setLoading((prev) => ({ ...prev, followers: false }))
      }
    }

    if (value === "following" && following.length === 0 && !loading.following) {
      setLoading((prev) => ({ ...prev, following: true }))
      try {
        const response = await api.get(`/users/${user.id}/following`)
        setFollowing(response.data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch following",
        })
      } finally {
        setLoading((prev) => ({ ...prev, following: false }))
      }
    }
  }

  return (
    <Tabs defaultValue="posts" className="mt-6" onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6">
        {loading.posts ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <PostList initialPosts={posts} />
        )}
      </TabsContent>
      <TabsContent value="followers" className="mt-6">
        {loading.followers ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <UserList users={followers} />
        )}
      </TabsContent>
      <TabsContent value="following" className="mt-6">
        {loading.following ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <UserList users={following} />
        )}
      </TabsContent>
    </Tabs>
  )
}


"use client"

import { useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { GET_USER, GET_USER_POSTS, GET_FOLLOWERS, GET_FOLLOWING } from "../graphql/queries"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import ProfileHeader from "../components/profile-header"
import PostCard from "../components/post-card"
import UserCard from "../components/user-card"
import { Skeleton } from "../components/ui/skeleton"
import { Card } from "../components/ui/card"
import type { User } from "../types"

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  })

  const {
    loading: postsLoading,
    error: postsError,
    data: postsData,
    refetch: refetchPosts,
  } = useQuery(GET_USER_POSTS, {
    variables: { userId },
    skip: !userId,
  })

  const {
    loading: followersLoading,
    error: followersError,
    data: followersData,
    refetch: refetchFollowers,
  } = useQuery(GET_FOLLOWERS, {
    variables: { userId },
    skip: !userId,
  })

  const {
    loading: followingLoading,
    error: followingError,
    data: followingData,
    refetch: refetchFollowing,
  } = useQuery(GET_FOLLOWING, {
    variables: { userId },
    skip: !userId,
  })

  const refetchAll = () => {
    refetchUser()
    refetchPosts()
    refetchFollowers()
    refetchFollowing()
  }

  if (userLoading) {
    return (
      <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </Card>
      </main>
    )
  }

  if (userError) {
    return (
      <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
        <div className="text-center py-10 text-red-500">Error loading profile: {userError.message}</div>
      </main>
    )
  }

  const user = userData.user as User & {
    _count: { followers: number; following: number; posts: number }
    isFollowing: boolean
  }

  return (
    <main className="container max-w-4xl mx-auto py-4 px-4 md:px-0">
      <ProfileHeader
        user={{
          id: user.id,
          name: user.name || "",
          username: user.username || "",
          email: user.email,
          image: user.image,
          bio: user.bio,
          followersCount: user._count.followers,
          followingCount: user._count.following,
          postsCount: user._count.posts,
          isFollowing: user.isFollowing,
        }}
        onFollowToggled={refetchAll}
      />

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {postsLoading ? (
            <div className="space-y-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-3 w-[80px]" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : postsError ? (
            <div className="text-center py-10 text-red-500">Error loading posts: {postsError.message}</div>
          ) : postsData.userPosts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {postsData.userPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    content: post.content,
                    createdAt: new Date(post.createdAt),
                    author: post.author,
                    likeCount: post._count.likes,
                    isLiked: post.isLiked,
                  }}
                  onLikeToggled={refetchPosts}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="followers">
          {followersLoading ? (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : followersError ? (
            <div className="text-center py-10 text-red-500">Error loading followers: {followersError.message}</div>
          ) : followersData.followers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No followers yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {followersData.followers.map((user: any) => (
                <UserCard
                  key={user.id}
                  user={{
                    id: user.id,
                    name: user.name || "",
                    username: user.username || "",
                    email: user.email,
                    image: user.image,
                    bio: user.bio,
                    followersCount: user._count.followers,
                    followingCount: user._count.following,
                    postsCount: user._count.posts,
                    isFollowing: user.isFollowing,
                  }}
                  onFollowToggled={refetchFollowers}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="following">
          {followingLoading ? (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : followingError ? (
            <div className="text-center py-10 text-red-500">Error loading following: {followingError.message}</div>
          ) : followingData.following.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Not following anyone yet</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {followingData.following.map((user: any) => (
                <UserCard
                  key={user.id}
                  user={{
                    id: user.id,
                    name: user.name || "",
                    username: user.username || "",
                    email: user.email,
                    image: user.image,
                    bio: user.bio,
                    followersCount: user._count.followers,
                    followingCount: user._count.following,
                    postsCount: user._count.posts,
                    isFollowing: user.isFollowing,
                  }}
                  onFollowToggled={refetchFollowing}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}

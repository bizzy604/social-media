// Common types used throughout the application

export interface User {
  id: string
  name: string | null
  username: string | null
  email: string | null
  image: string | null
  bio: string | null
  followersCount?: number
  followingCount?: number
  postsCount?: number
  isFollowing?: boolean
}

export interface Post {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
  likeCount: number
  isLiked: boolean
}

export interface DecodedToken {
  id: string
  name: string
  email: string
  username: string
  image?: string
  exp: number
}

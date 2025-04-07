export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar: string | null
  bio: string | null
  followers?: { followerId: number }[]
  following?: { followingId: number }[]
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: number
  content: string
  authorId: number
  author: {
    id: number
    name: string
    username: string
    avatar: string | null
  }
  likes: { userId: number }[]
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: number
  userId: number
  postId: number
  createdAt: string
}

export interface Follow {
  id: number
  followerId: number
  followingId: number
  createdAt: string
}


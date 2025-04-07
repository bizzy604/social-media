import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Middleware
app.use(cors())
app.use(express.json())

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" })
  }
}

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    })

    return res.status(201).json({ success: true })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({
      error: "An error occurred during registration",
    })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(400).json({
        error: "Invalid email or password",
      })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(400).json({
        error: "Invalid email or password",
      })
    }

    // Create JWT token
    const token = jwt.sign({ sub: user.id.toString() }, JWT_SECRET, { expiresIn: "7d" })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return res.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      error: "An error occurred during login",
    })
  }
})

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

// Posts routes
app.get("/api/posts/feed", authenticateToken, async (req, res) => {
  try {
    const { cursor } = req.query
    const userId = req.user.id

    const where = cursor
      ? {
          id: { lt: Number(cursor) },
          OR: [
            { authorId: userId },
            {
              author: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
            },
          ],
        }
      : {
          OR: [
            { authorId: userId },
            {
              author: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
            },
          ],
        }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    })

    res.json(posts)
  } catch (error) {
    console.error("Failed to fetch feed:", error)
    res.status(500).json({ error: "Failed to fetch feed" })
  }
})

app.post("/api/posts", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body
    const userId = req.user.id

    const post = await prisma.post.create({
      data: {
        content,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    })

    res.status(201).json(post)
  } catch (error) {
    console.error("Failed to create post:", error)
    res.status(500).json({ error: "Failed to create post" })
  }
})

app.post("/api/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const postId = Number(req.params.id)
    const userId = req.user.id

    const like = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    })

    res.status(201).json(like)
  } catch (error) {
    console.error("Failed to like post:", error)
    res.status(500).json({ error: "Failed to like post" })
  }
})

app.delete("/api/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const postId = Number(req.params.id)
    const userId = req.user.id

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Failed to unlike post:", error)
    res.status(500).json({ error: "Failed to unlike post" })
  }
})

// User routes
app.get("/api/users/suggestions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        followers: {
          none: {
            followerId: userId,
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
      },
    })

    res.json(users)
  } catch (error) {
    console.error("Failed to fetch suggestions:", error)
    res.status(500).json({ error: "Failed to fetch suggestions" })
  }
})

app.get("/api/users/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        followers: {
          where: {
            follower: {
              username: {
                not: username,
              },
            },
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Failed to fetch user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

app.get("/api/users/:id/posts", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.params.id)

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    })

    res.json(posts)
  } catch (error) {
    console.error("Failed to fetch user posts:", error)
    res.status(500).json({ error: "Failed to fetch user posts" })
  }
})

app.get("/api/users/:id/followers", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.params.id)

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    res.json(followers.map((follow) => follow.follower))
  } catch (error) {
    console.error("Failed to fetch followers:", error)
    res.status(500).json({ error: "Failed to fetch followers" })
  }
})

app.get("/api/users/:id/following", authenticateToken, async (req, res) => {
  try {
    const userId = Number(req.params.id)

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    res.json(following.map((follow) => follow.following))
  } catch (error) {
    console.error("Failed to fetch following:", error)
    res.status(500).json({ error: "Failed to fetch following" })
  }
})

app.post("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const followingId = Number(req.params.id)
    const followerId = req.user.id

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" })
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    })

    res.status(201).json(follow)
  } catch (error) {
    console.error("Failed to follow user:", error)
    res.status(500).json({ error: "Failed to follow user" })
  }
})

app.delete("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const followingId = Number(req.params.id)
    const followerId = req.user.id

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Failed to unfollow user:", error)
    res.status(500).json({ error: "Failed to unfollow user" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


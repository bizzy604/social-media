"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { setToken, removeToken, isTokenValid, getDecodedToken } from "../lib/auth"
import { useMutation } from "@apollo/client"
import { LOGIN_USER } from "../graphql/mutations"
import type { User } from "../types"

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [loginMutation] = useMutation(LOGIN_USER)

  useEffect(() => {
    const initAuth = () => {
      if (isTokenValid()) {
        const decoded = getDecodedToken()
        if (decoded) {
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            username: decoded.username,
            image: decoded.image || null,
            bio: null,
          })
          setIsAuthenticated(true)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await loginMutation({
        variables: { email, password },
      })

      const { token, user } = data.login
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

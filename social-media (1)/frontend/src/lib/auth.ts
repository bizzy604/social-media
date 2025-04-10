import { jwtDecode } from "jwt-decode"
import type { DecodedToken } from "../types"

const TOKEN_KEY = "social_media_token"

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isTokenValid = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}

export const getDecodedToken = (): DecodedToken | null => {
  const token = getToken()
  if (!token) return null

  try {
    return jwtDecode<DecodedToken>(token)
  } catch (error) {
    return null
  }
}

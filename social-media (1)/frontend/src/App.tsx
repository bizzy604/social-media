"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { useAuth } from "./contexts/auth-context"

import { Layout } from "./components"
import { HomePage, ExplorePage, ProfilePage, SignInPage, SignUpPage, NotFoundPage } from "./pages"

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Protected Routes */}
          <Route index element={isAuthenticated ? <HomePage /> : <Navigate to="/auth/signin" />} />
          <Route path="explore" element={isAuthenticated ? <ExplorePage /> : <Navigate to="/auth/signin" />} />
          <Route path="profile/:userId" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/auth/signin" />} />

          {/* Auth Routes */}
          <Route path="auth/signin" element={!isAuthenticated ? <SignInPage /> : <Navigate to="/" />} />
          <Route path="auth/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/" />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App

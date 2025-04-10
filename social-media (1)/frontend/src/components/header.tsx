"use client"

import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { useAuth } from "../contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Home, LogOut, User, Users } from "lucide-react"

export default function Header() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b">
      <div className="container max-w-4xl mx-auto py-4 px-4 md:px-0 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          SocialFeed
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Button variant={isActive("/") ? "default" : "ghost"} size="sm" asChild>
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Feed
                  </Link>
                </Button>
                <Button variant={isActive("/explore") ? "default" : "ghost"} size="sm" asChild>
                  <Link to="/explore">
                    <Users className="w-4 h-4 mr-2" />
                    Explore
                  </Link>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/signin">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

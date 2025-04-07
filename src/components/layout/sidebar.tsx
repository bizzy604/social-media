"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, User, MessageSquare, Bell, Settings } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { cn } from "../../lib/utils"
import { useState, useEffect } from "react"
import { api } from "../../lib/api"
import type { User as UserType } from "../../lib/types"
import { X } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { useToast } from "../ui/use-toast"

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers')
  const [followers, setFollowers] = useState<UserType[]>([])
  const [following, setFollowing] = useState<UserType[]>([])
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await api.get("/users/suggestions")
        setSuggestions(response.data)
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuggestions()
  }, [])

  useEffect(() => {
    const fetchFriends = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          api.get('/users/followers'),
          api.get('/users/following')
        ]);
        
        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load friends data",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFriends();
  }, [isOpen, toast]);

  if (!user) return null

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 pr-4 py-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <nav className="space-y-1 mb-6">
          <Link to="/">
            <div className={cn("sidebar-item", location.pathname === "/" && "active")}>
              <Home size={24} />
              <span>Home</span>
            </div>
          </Link>
          <Link to={`/profile/${user.username}`}>
            <div className={cn("sidebar-item", location.pathname.includes("/profile") && "active")}>
              <User size={24} />
              <span>Profile</span>
            </div>
          </Link>
          <div className="sidebar-item">
            <MessageSquare size={24} />
            <span>Messages</span>
          </div>
          <div className="sidebar-item">
            <Bell size={24} />
            <span>Notifications</span>
          </div>
          <Link to="/settings">
            <div className={cn("sidebar-item", location.pathname === "/settings" && "active")}>
              <Settings size={24} />
              <span>Settings</span>
            </div>
          </Link>
        </nav>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground px-2 mb-2">
            Suggested people to follow
          </h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.slice(0, 5).map(suggestion => (
                <SuggestionItem key={suggestion.id} user={suggestion} />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Friends sidebar that shows when clicked */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-80 bg-background p-6 shadow-lg animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Friends</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex border-b mb-4">
              <button
                className={cn(
                  "flex-1 pb-2 font-medium",
                  activeTab === 'followers' 
                    ? "border-b-2 border-primary" 
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('followers')}
              >
                Followers
              </button>
              <button
                className={cn(
                  "flex-1 pb-2 font-medium",
                  activeTab === 'following' 
                    ? "border-b-2 border-primary" 
                    : "text-muted-foreground"
                )}
                onClick={() => setActiveTab('following')}
              >
                Following
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === 'followers' ? (
                  followers.length > 0 ? (
                    followers.map(user => (
                      <FriendItem key={user.id} user={user} />
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No followers yet</p>
                  )
                ) : (
                  following.length > 0 ? (
                    following.map(user => (
                      <FriendItem key={user.id} user={user} />
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Not following anyone yet</p>
                  )
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function SuggestionItem({ user }: { user: UserType }) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      if (isFollowing) {
        await api.delete(`/users/${user.id}/follow`)
      } else {
        await api.post(`/users/${user.id}/follow`)
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
      <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium truncate">{user.name}</span>
      </Link>
      <button 
        onClick={handleFollow}
        disabled={isLoading}
        className={cn(
          "text-xs px-2 py-1 rounded-md font-medium",
          isFollowing 
            ? "bg-muted text-muted-foreground" 
            : "bg-primary text-primary-foreground"
        )}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  )
}

function FriendItem({ user }: { user: UserType }) {
  return (
    <Link 
      to={`/profile/${user.username}`}
      className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </Link>
  );
}

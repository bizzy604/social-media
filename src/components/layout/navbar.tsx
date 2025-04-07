import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Home, Search, User, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-white rounded-full p-1.5">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="22" 
              height="22" 
              className="text-primary"
            >
              <path 
                fill="currentColor" 
                d="M12 1c-4.42 0-8 3.58-8 8 0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 20 9c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">ConnectHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-white hover:text-opacity-80 p-2">
            <Home className="h-6 w-6" />
          </Link>
          <Link to="/search" className="text-white hover:text-opacity-80 p-2">
            <Search className="h-6 w-6" />
          </Link>
          <Link to="/notifications" className="text-white hover:text-opacity-80 p-2">
            <Bell className="h-6 w-6" />
          </Link>
          <Link to="/profile" className="text-white hover:text-opacity-80 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || undefined} alt={user?.name || undefined} />
              <AvatarFallback className="bg-secondary text-primary">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary px-4 py-2 pb-4 shadow-md">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="text-white flex items-center gap-2 p-2 rounded-md hover:bg-primary-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/search" 
              className="text-white flex items-center gap-2 p-2 rounded-md hover:bg-primary-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </Link>
            <Link 
              to="/notifications" 
              className="text-white flex items-center gap-2 p-2 rounded-md hover:bg-primary-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </Link>
            <Link 
              to="/profile" 
              className="text-white flex items-center gap-2 p-2 rounded-md hover:bg-primary-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Button 
              variant="secondary" 
              className="w-full mt-2" 
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              Log Out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}


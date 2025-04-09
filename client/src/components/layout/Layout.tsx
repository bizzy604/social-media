import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-indigo-600 font-medium' : 'text-gray-700 hover:text-indigo-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <nav className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-indigo-600">Bizzy</span>
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-center space-x-4">
                    <Link to="/" className={`${isActive('/')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}>
                      Feed
                    </Link>
                    <Link to="/explore" className={`${isActive('/explore')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}>
                      Explore
                    </Link>
                    {user?.username && (
                      <Link 
                        to={`/profile/${user.username}`} 
                        className={`${isActive(`/profile/${user.username}`)} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                      >
                        Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-controls="mobile-menu"
                  aria-expanded="false"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Icon when menu is closed */}
                  <svg
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* Icon when menu is open */}
                  <svg
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* User menu (desktop) */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Link to={user?.username ? `/profile/${user.username}` : '/'} className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-medium">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{user?.username}</span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu, show/hide based on menu state */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`${isActive('/')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                to="/explore"
                className={`${isActive('/explore')} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              {user?.username && (
                <Link
                  to={`/profile/${user.username}`}
                  className={`${isActive(`/profile/${user.username}`)} block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-gray-700 hover:text-indigo-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      <main className="py-6">{children}</main>
    </div>
  );
}

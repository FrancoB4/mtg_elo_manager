import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authHook';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600">
                <span className="text-sm font-bold text-white">MTG</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">MTG Elo Manager</h1>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/rankings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/rankings') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              🏆 Rankings
            </Link>
            <Link
              to="/tournaments"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tournaments') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              🎯 Torneos
            </Link>
            <Link
              to="/leagues"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leagues') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              🏆 Ligas
            </Link>
            <Link
              to="/players"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/players') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              👥 Jugadores
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    Hola, <span className="font-medium">{user?.username}</span>
                  </div>
                  <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/signin"
                  className="text-indigo-600 hover:text-indigo-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-4 overflow-x-auto">
            <Link
              to="/rankings"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/rankings') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              🏆 Rankings
            </Link>
            <Link
              to="/tournaments"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/tournaments') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              🎯 Torneos
            </Link>
            <Link
              to="/leagues"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/leagues') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              🏆 Ligas
            </Link>
            <Link
              to="/players"
              className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/players') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              👥 Jugadores
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
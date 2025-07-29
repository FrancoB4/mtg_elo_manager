import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authHook';
import { UserProfileModal } from './UserProfileModal';
import { 
  BsTrophy, 
  BsBullseye,
  BsPeople, 
  BsPersonCircle,
  BsBoxArrowRight,
  BsPerson,
  BsPersonPlus,
  BsShieldCheck,
  BsHouseDoor
} from 'react-icons/bs';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  // Helper function to render icons with proper typing
  const renderIcon = (IconComponent: React.ComponentType<{ className?: string }>, className: string = "w-4 h-4") => {
    return React.createElement(IconComponent, { className });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600">
                {renderIcon(BsShieldCheck, "w-5 h-5 text-white")}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">MTG Elo Manager</h1>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {renderIcon(BsHouseDoor)}
              <span>Inicio</span>
            </Link>
            <Link
              to="/rankings"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/rankings') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {renderIcon(BsTrophy)}
              <span>Rankings</span>
            </Link>
            <Link
              to="/tournaments"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tournaments') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {renderIcon(BsBullseye)}
              <span>Torneos</span>
            </Link>
            <Link
              to="/leagues"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/leagues') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {renderIcon(BsShieldCheck)}
              <span>Ligas</span>
            </Link>
            <Link
              to="/players"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/players') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              {renderIcon(BsPeople)}
              <span>Jugadores</span>
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
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="h-8 w-8 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center transition-colors"
                    title="Ver perfil"
                  >
                    {renderIcon(BsPersonCircle, "w-5 h-5 text-indigo-600")}
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {renderIcon(BsBoxArrowRight)}
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/signin"
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {renderIcon(BsPerson)}
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/auth/signup"
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {renderIcon(BsPersonPlus)}
                  <span>Crear Cuenta</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-4 overflow-x-auto">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                location.pathname === '/' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {renderIcon(BsHouseDoor)}
              <span>Inicio</span>
            </Link>
            <Link
              to="/rankings"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/rankings') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {renderIcon(BsTrophy)}
              <span>Rankings</span>
            </Link>
            <Link
              to="/tournaments"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/tournaments') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {renderIcon(BsBullseye)}
              <span>Torneos</span>
            </Link>
            <Link
              to="/leagues"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/leagues') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {renderIcon(BsShieldCheck)}
              <span>Ligas</span>
            </Link>
            <Link
              to="/players"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive('/players') 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {renderIcon(BsPeople)}
              <span>Jugadores</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </nav>
  );
};

export default Header;
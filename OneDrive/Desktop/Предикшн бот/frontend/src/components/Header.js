import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Trophy, History, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-lg border-b border-purple-500 border-opacity-30">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl crystal-ball">🔮</span>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              Предикшн Бот
            </span>
          </Link>

          {/* Навигация */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            <NavLink
              to="/"
              icon={Home}
              label="Главная"
              isActive={isActive('/')}
            />
            <NavLink
              to="/profile"
              icon={User}
              label="Профиль"
              isActive={isActive('/profile')}
            />
            <NavLink
              to="/history"
              icon={History}
              label="История"
              isActive={isActive('/history')}
            />
            <NavLink
              to="/rankings"
              icon={Trophy}
              label="Рейтинг"
              isActive={isActive('/rankings')}
            />

            {/* Пользователь */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3 ml-4 pl-4 border-l border-purple-500 border-opacity-30">
                <div className="text-sm text-purple-200">
                  {user.first_name}
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-purple-300 hover:text-white transition-colors"
                  title="Выйти"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

const NavLink = ({ to, icon: Icon, label, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-purple-600 bg-opacity-30 text-white border border-purple-500 border-opacity-50'
        : 'text-purple-200 hover:text-white hover:bg-purple-600 hover:bg-opacity-20'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:block text-sm font-medium">{label}</span>
  </Link>
);

export default Header; 
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

const Navbar = ({ onMenuClick }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/campaigns') return 'Campaigns'
    if (path === '/donations') return 'Donations'
    if (path === '/receipts') return 'Receipts'
    return 'Dashboard'
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  const isDark = theme === 'dark'

  return (
    <nav className={`border-b shadow-sm transition-colors duration-200 ${isDark
        ? 'bg-slate-800 border-slate-700'
        : 'bg-white border-gray-200'
      }`}>
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-lg transition-colors ${isDark
              ? 'hover:bg-gray-700 text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Title */}
        <h1 className={`text-xl font-semibold transition-colors ${isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
          {getPageTitle()}
        </h1>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark
                ? 'hover:bg-gray-700 text-yellow-400'
                : 'hover:bg-[#E6F4EA] text-gray-600'
              }`}
            title="Toggle theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-[#E6F4EA] text-gray-800 hover:bg-[#D4E8D9]'
              }`}
          >
            Logout
          </button>

          {/* User Profile Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${isDark
                ? 'bg-[#4CAF50] hover:bg-[#45a049] text-white'
                : 'bg-[#E6F4EA] hover:bg-[#D4E8D9] text-gray-800'
              }`}
            title={user?.name || 'User'}
          >
            <span className="font-semibold">{getUserInitials()}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


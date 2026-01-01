import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useThemeStore from '../store/themeStore'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/campaigns', label: 'Campaigns', icon: '🎯' },
    { path: '/donations', label: 'Donations', icon: '💰' },
    { path: '/receipts', label: 'Receipts', icon: '📄' }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'
          } shadow-lg ${isDark
            ? 'bg-slate-800 border-r border-slate-700'
            : 'bg-[#E6F4EA]'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand & Toggle */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'
            }`}>
            {/* Hide Logo Text when collapsed */}
            <h1 className={`text-2xl font-bold whitespace-nowrap overflow-hidden transition-all duration-300 ${isDark ? 'text-slate-100' : 'text-gray-800'
              } ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              DonationHub
            </h1>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg transition-colors ${isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-green-100 text-gray-500 hover:text-green-700'
                } ${isCollapsed ? 'mx-auto' : ''}`}
            >
              {isCollapsed ? (
                // Expand Icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                // Collapse Icon
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      title={isCollapsed ? item.label : ''}
                      className={`flex items-center py-3 rounded-lg transition-all duration-200 overflow-hidden ${isCollapsed ? 'justify-center px-2' : 'px-4'
                        } ${isActive
                          ? isDark
                            ? 'bg-[#4CAF50] text-white font-semibold shadow-md'
                            : 'bg-[#4CAF50] text-white font-semibold shadow-md'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
                        }`}
                    >
                      <span className={`text-xl flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`}>
                        {item.icon}
                      </span>

                      {/* Label with opacity transition */}
                      <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                        }`}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import useThemeStore from '../store/themeStore'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    // Apply theme to document root for global dark mode
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className={`min-h-screen transition-colors duration-200 group/layout flex ${isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
      {/* 
        Sidebar is fixed, so it doesn't take space in the flex container.
        We pass sidebarOpen/setSidebarOpen but Sidebar also manages internal desktop collapse.
      */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* 
        Spacer Element (Desktop Only)
        This element reserves space in the flex container matching the fixed Sidebar's width.
        It detects the Sidebar's width using the CSS :has() selector on the parent .group/layout.
        
        Logic:
        - Defaults to w-64 (expanded)
        - If parent contains aside.w-20, shrink to w-20
        - If parent contains aside.w-64, expand to w-64
      */}
      <div className={`
        hidden lg:block shrink-0 transition-all duration-300 ease-in-out
        w-64
        group-has-[aside.w-20]/layout:w-20
        group-has-[aside.w-64]/layout:w-64
      `} aria-hidden="true" />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

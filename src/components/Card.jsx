import React from 'react'
import useThemeStore from '../store/themeStore'

const Card = ({ children, className = '', onClick }) => {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <div
      className={`rounded-lg shadow-md p-6 transition-colors duration-200 ${isDark
          ? 'bg-slate-800 border border-slate-700'
          : 'bg-white'
        } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card


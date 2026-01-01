import React from 'react'
import useThemeStore from '../store/themeStore'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: isDark
      ? 'bg-[#4CAF50] text-white hover:bg-[#45a049] focus:ring-[#4CAF50]'
      : 'bg-[#4CAF50] text-white hover:bg-[#45a049] focus:ring-[#4CAF50]',
    secondary: isDark
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-700'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: isDark
      ? 'border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white focus:ring-[#4CAF50]'
      : 'border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white focus:ring-[#4CAF50]'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button


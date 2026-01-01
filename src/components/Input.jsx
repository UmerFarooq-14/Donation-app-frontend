import React from 'react'
import useThemeStore from '../store/themeStore'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  ...props
}) => {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${error
            ? 'border-red-500'
            : isDark
              ? 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-[#4CAF50]'
              : 'border-gray-300 bg-white focus:ring-[#4CAF50]'
          } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input


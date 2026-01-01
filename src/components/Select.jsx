import React from 'react'
import useThemeStore from '../store/themeStore'

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${error
            ? 'border-red-500'
            : isDark
              ? 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-[#4CAF50]'
              : 'border-gray-300 bg-white focus:ring-[#4CAF50]'
          } ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Select


import React, { useEffect } from 'react'
import Button from './Button'
import useThemeStore from '../store/themeStore'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className={`rounded-lg shadow-xl ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal


import React from 'react'
import useThemeStore from '../store/themeStore'

const Table = ({ headers, data, renderRow, className = '', emptyMessage = 'No data available' }) => {
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full border rounded-lg transition-colors duration-200 ${isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
        } ${className}`}>
        <thead className={isDark ? 'bg-gray-700' : 'bg-[#E6F4EA]'}>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
          }`}>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className={`px-6 py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => renderRow(row, index))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table


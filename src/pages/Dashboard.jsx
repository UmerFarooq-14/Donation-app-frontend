import React, { useState, useEffect } from 'react'
import Card from '../components/Card'
import Table from '../components/Table'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'
import { getMyDonations, getAllDonationsAdmin } from '../api/donationApi'

const Dashboard = () => {
  const theme = useThemeStore((state) => state.theme)
  const isAdmin = useAuthStore((state) => state.isAdmin())
  const isDark = theme === 'dark'

  const [stats, setStats] = useState({
    totalDonations: 0,
    verifiedDonations: 0,
    pendingDonations: 0
  })

  const [recentDonations, setRecentDonations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        let data
        if (isAdmin) {
          data = await getAllDonationsAdmin()
        } else {
          data = await getMyDonations()
        }

        // Handle data structure
        const donations = Array.isArray(data) ? data : (data.donations || [])
        let total = 0
        let verified = 0
        let pending = 0

        // Calculate stats and total from fetched data
        // Note: user endpoint might return {totalDonations, donations}
        // admin endpoint might return array or similar object
        // If the API returns aggregates we could use them, but calculating from list is safer for consistency if list is all-inclusive or we can't rely on aggregation

        donations.forEach(d => {
          const amount = parseFloat(d.amount) || 0
          total += amount
          if (d.status === 'Verified') verified += amount
          if (d.status === 'Pending') pending += amount
        })

        // If backend provides pre-calculated total, we might prefer that, but logic here is fine for frontend-only

        setStats({
          totalDonations: total,
          verifiedDonations: verified,
          pendingDonations: pending
        })

        // Sort by date (newest first) and take top 5
        const sorted = [...donations].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || b.date))
        setRecentDonations(sorted.slice(0, 5))

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const tableHeaders = ['Date', 'Campaign', 'Amount', 'Status']
  // Add Donor Name to headers if Admin
  if (isAdmin) {
    tableHeaders.splice(1, 0, 'Donor Name')
  }

  const renderDonationRow = (donation, index) => (
    <tr key={donation._id || donation.id || index} className={`transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-green-50'
      }`}>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
        }`}>
        {new Date(donation.createdAt || donation.date).toLocaleDateString()}
      </td>
      {isAdmin && (
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>
          {donation.user?.name || donation.donorName || 'Anonymous'}
        </td>
      )}
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
        }`}>
        {donation.campaignId?.title || donation.campaign || 'General'}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'
        }`}>
        {formatAmount(donation.amount)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${donation.status === 'Verified'
          ? 'bg-green-100 text-green-800'
          : donation.status === 'Pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {donation.status}
        </span>
      </td>
    </tr>
  )

  if (loading) return <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Loading dashboard...</div>

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Total Donations
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                {formatAmount(stats.totalDonations)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-600' : 'bg-blue-100 text-blue-600'}`}>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Verified Donations
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                {formatAmount(stats.verifiedDonations)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-600' : 'bg-green-100 text-green-600'}`}>
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Pending Donations
              </p>
              <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                {formatAmount(stats.pendingDonations)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-yellow-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Donations Table */}
      <Card>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
          Recent Donations
        </h2>
        {recentDonations.length > 0 ? (
          <Table
            headers={tableHeaders}
            data={recentDonations}
            renderRow={renderDonationRow}
          />
        ) : (
          <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No recent donations found.
          </div>
        )}
      </Card>
    </div>
  )
}

export default Dashboard

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Card from '../components/Card'
import Table from '../components/Table'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import { getMyDonations, getAllDonationsAdmin, updateDonationStatus } from '../api/donationApi'

const Donations = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin())
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filteredDonations, setFilteredDonations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  useEffect(() => {
    fetchDonations()
  }, [isAdmin])

  // Filter effect
  useEffect(() => {
    let filtered = [...donations]

    if (isAdmin && searchTerm) {
      filtered = filtered.filter(donation =>
        (donation.user?.name || donation.donorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donation.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(donation => donation.status === statusFilter)
    }

    if (isAdmin) {
      if (typeFilter) {
        filtered = filtered.filter(donation => donation.donationType === typeFilter)
      }
      if (paymentFilter) {
        filtered = filtered.filter(donation => donation.paymentMethod === paymentFilter)
      }
    }

    setFilteredDonations(filtered)
  }, [searchTerm, statusFilter, typeFilter, paymentFilter, donations, isAdmin])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      let data;
      if (isAdmin) {
        data = await getAllDonationsAdmin()
      } else {
        data = await getMyDonations()
      }
      // Handle response structure depending on backend
      const donationList = Array.isArray(data) ? data : (data.donations || [])
      setDonations(donationList)
      setFilteredDonations(donationList)
    } catch (err) {
      console.error("Failed to fetch donations", err)
      setError("Failed to load donations.")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Rejected', label: 'Rejected' }
  ]

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Zakat', label: 'Zakat' },
    { value: 'Sadqah', label: 'Sadqah' },
    { value: 'Fitra', label: 'Fitra' },
    { value: 'General', label: 'General' }
  ]

  const paymentOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'Online', label: 'Online' },
    { value: 'Bank', label: 'Bank Transfer' },
    { value: 'Cash', label: 'Cash' }
  ]

  const tableHeaders = isAdmin
    ? ['Date', 'Donor Name', 'Campaign', 'Amount', 'Status', 'Type', 'Payment', 'Action']
    : ['Date', 'Campaign', 'Amount', 'Status', 'Type', 'Payment']

  const handleVerify = async (id) => {
    try {
      await updateDonationStatus(id, 'Verified')
      // Update local state without reload
      setDonations(prev => prev.map(d =>
        (d._id === id || d.id === id) ? { ...d, status: 'Verified' } : d
      ))
      toast.success("Donation verified successfully")
    } catch (error) {
      console.error("Failed to verify donation:", error)
      toast.error("Failed to verify donation")
    }
  }

  const renderDonationRow = (donation, index) => {
    // Format: DD MMM YYYY, HH:MM
    const dateObj = new Date(donation.createdAt || donation.date)
    const date = isNaN(dateObj.getTime())
      ? 'Invalid Date'
      : dateObj.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    const donorName = donation.user?.name || donation.donorName || 'Anonymous'
    const campaignTitle = donation.campaignId?.title || donation.campaign // Populate title if object, or use category string fallback if title missing
    const id = donation._id || donation.id

    return (
      <tr key={id || index} className={`transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
        }`}>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>
          {date}
        </td>
        {isAdmin && (
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
            }`}>
            {donorName}
            <div className="text-xs text-gray-500">{donation.user?.email}</div>
          </td>
        )}
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>
          {campaignTitle}
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
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>
          {donation.donationType || donation.type}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>
          {donation.paymentMethod || donation.payment}
        </td>
        {isAdmin && (
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {donation.status === 'Pending' ? (
              <Button
                size="sm"
                onClick={() => handleVerify(id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Verify
              </Button>
            ) : donation.status === 'Verified' ? (
              <span className="text-green-600 font-semibold text-xs border border-green-600 px-2 py-1 rounded">
                Verified
              </span>
            ) : null}
          </td>
        )}
      </tr>
    )
  }

  if (loading) return <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Loading donations...</div>

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
            Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAdmin && (
              <Input
                label="Search by Donor"
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search donor name..."
              />
            )}

            <Select
              label="Status"
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />

            {isAdmin && (
              <>
                <Select
                  label="Type"
                  name="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  options={typeOptions}
                />

                <Select
                  label="Payment Method"
                  name="payment"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  options={paymentOptions}
                />
              </>
            )}

          </div>

          {(searchTerm || statusFilter || typeFilter || paymentFilter) && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setTypeFilter('')
                  setPaymentFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'
          }`}>
          {isAdmin ? 'All Donations' : 'My Donations'}
        </h2>

        {error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Table
            headers={tableHeaders}
            data={filteredDonations}
            renderRow={renderDonationRow}
            emptyMessage="No donations found"
          />
        )}
      </Card>
    </div>
  )
}

export default Donations

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Select from '../components/Select'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import {
  getAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../api/campaignApi'
import { createDonation, getAllDonationsAdmin } from '../api/donationApi'

const Campaigns = () => {
  const navigate = useNavigate()
  const isAdmin = useAuthStore((state) => state.isAdmin())
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    deadline: ''
  })
  const [donateFormData, setDonateFormData] = useState({
    amount: '',
    donationType: 'Zakat',
    paymentMethod: 'Online',
    campaign: 'Food' // Category field
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCampaignsAndDonations()
  }, [])

  const fetchCampaignsAndDonations = async () => {
    try {
      setLoading(true)

      // Fetch Campaigns
      const campaignData = await getAllCampaigns()
      const fetchedCampaigns = Array.isArray(campaignData) ? campaignData : campaignData.campaign || []

      // Fetch All Donations (for calculation) - Best effort
      let allDonations = []
      try {
        const donationData = await getAllDonationsAdmin()
        allDonations = Array.isArray(donationData) ? donationData : (donationData.donations || [])
      } catch (err) {
        console.warn("Could not fetch donations for progress calculation (likely not admin)", err)
        // Fallback: If we can't fetch all donations, we rely on whatever the campaign object has
      }

      // Map and Merge Logic
      const processedCampaigns = fetchedCampaigns.map(campaign => {
        const cId = campaign._id || campaign.id;

        // Filter verified donations for this campaign
        // robust check: matching ID or checking if populated object matches
        const campaignDonations = allDonations.filter(d => {
          const dCampaignId = d.campaignId?._id || d.campaignId || d.campaign; // Handle populated or raw ID
          return (dCampaignId === cId) && (d.status === 'Verified');
        });

        // Calculate sum
        const verifiedSum = campaignDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
          ...campaign,
          calculatedVerifiedAmount: verifiedSum
        }
      })

      // Sort: Active first, Inactive last
      const sortedCampaigns = [...processedCampaigns].sort((a, b) => {
        const activeA = a.isActive !== false // Default true
        const activeB = b.isActive !== false // Default true
        if (activeA === activeB) return 0
        return activeA ? -1 : 1
      })

      setCampaigns(sortedCampaigns)
    } catch (error) {
      console.error('Failed to fetch campaigns', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  // Formatting: Plain numbers, no currency symbol
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const calculateProgress = (raisedAmount, goalAmount) => {
    const goal = goalAmount || 0
    if (goal === 0) return 0
    return Math.min((raisedAmount / goal) * 100, 100)
  }

  // Get amounts (prioritizing our fresh calculation)
  const getDisplayValues = (campaign) => {
    // Use the verified amount we calculated in fetch
    // Fallback to totalVerifiedDonations (backend future proof) or currentAmount
    const raised = campaign.calculatedVerifiedAmount !== undefined
      ? campaign.calculatedVerifiedAmount
      : (campaign.totalVerifiedDonations || campaign.currentAmount || 0);

    return raised;
  }

  const handleOpenCreateModal = () => {
    setEditingCampaign(null)
    setFormData({ title: '', description: '', goalAmount: '', deadline: '' })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (campaign) => {
    if (!campaign.isActive && campaign.isActive !== undefined) return
    setEditingCampaign(campaign)
    // Format date for input type="date"
    const formattedDate = campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : ''

    setFormData({
      title: campaign.title,
      description: campaign.description,
      goalAmount: campaign.goalAmount.toString(),
      deadline: formattedDate
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDonateChange = (e) => {
    const { name, value } = e.target
    setDonateFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) newErrors.goalAmount = 'Valid goal amount is required'
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required'
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      deadlineDate.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        newErrors.deadline = 'Please select a date today or later'
      }
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      if (validationErrors.deadline === 'Please select a date today or later') {
        toast.error("Please select a date today or later")
      }
      return
    }

    try {
      const payload = {
        ...formData,
        goalAmount: parseFloat(formData.goalAmount)
      }

      if (editingCampaign) {
        await updateCampaign(editingCampaign._id || editingCampaign.id, payload)
      } else {
        await createCampaign(payload)
      }

      await fetchCampaignsAndDonations()
      setIsModalOpen(false)
      setFormData({ title: '', description: '', goalAmount: '', deadline: '' })
      setEditingCampaign(null)
    } catch (error) {
      console.error('Error saving campaign:', error)
      setErrors({ submit: 'Failed to save campaign. Please try again.' })
    }
  }

  const handleDelete = (campaign) => {
    if (!campaign.isActive && campaign.isActive !== undefined) return
    setCampaignToDelete(campaign)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!campaignToDelete) return

    try {
      await deleteCampaign(campaignToDelete._id || campaignToDelete.id)
      await fetchCampaignsAndDonations()
      setIsDeleteModalOpen(false)
      setCampaignToDelete(null)
    } catch (error) {
      console.error('Error deleting campaign:', error)
    }
  }

  const handleDonate = (campaign) => {
    if (!campaign.isActive && campaign.isActive !== undefined) return
    setSelectedCampaign(campaign)
    // Reset form with category default
    setDonateFormData({
      amount: '',
      donationType: 'Zakat',
      paymentMethod: 'Online',
      campaign: 'Food'
    })
    setIsDonateModalOpen(true)
  }

  const handleDonateSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCampaign) return

    try {
      const payload = {
        campaignId: selectedCampaign._id || selectedCampaign.id,
        amount: parseFloat(donateFormData.amount),
        donationType: donateFormData.donationType,
        paymentMethod: donateFormData.paymentMethod,
        campaign: donateFormData.campaign // This is the Category (Food, Education, etc.)
      }

      await createDonation(payload)

      toast.success(`Donation of ${formatAmount(payload.amount)} submitted successfully!`)
      setIsDonateModalOpen(false)
      setSelectedCampaign(null)
      // Refresh campaigns to update progress bars if backend updates immediately
      await fetchCampaignsAndDonations()
    } catch (error) {
      console.error("Donation failed:", error)
      toast.error("Failed to process donation. Please try again.")
    }
  }

  const handleViewDetails = (id, isEffectiveActive) => {
    if (!isEffectiveActive) return;
    navigate(`/campaigns/${id}`)
  }

  if (loading) {
    return <div className={`flex justify-center items-center h-64 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Loading campaigns...</div>
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleOpenCreateModal}>+ Create Campaign</Button>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className={`text-center py-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>No campaigns found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const id = campaign._id || campaign.id;
            const isActive = campaign.isActive !== false; // Default to true if undefined

            const raisedAmount = getDisplayValues(campaign);
            const progress = calculateProgress(raisedAmount, campaign.goalAmount);

            // Check if deadline has passed (before today)
            const deadlineDate = new Date(campaign.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            deadlineDate.setHours(0, 0, 0, 0);
            const isExpired = deadlineDate < today;

            const isEffectiveActive = isActive && !isExpired;

            return (
              <Card
                key={id}
                className={`hover:shadow-lg transition-all cursor-pointer relative ${!isEffectiveActive ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                onClick={() => handleViewDetails(id, isEffectiveActive)}
              >
                {!isEffectiveActive && (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded z-10 font-bold uppercase tracking-wider">
                    {isExpired ? 'Expired' : 'Inactive'}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                      {campaign.title}
                    </h3>
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {campaign.description}
                    </p>
                  </div>


                  <div>
                    <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {isAdmin ? (
                        <>Raised: {formatAmount(raisedAmount)} / </>
                      ) : null}
                      Goal: {formatAmount(campaign.goalAmount)}
                    </div>

                    {isAdmin && (
                      <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${'bg-[#4CAF50]'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    <p>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {isAdmin ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 ${!isEffectiveActive ? 'cursor-not-allowed opacity-50' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEffectiveActive) handleOpenEditModal(campaign);
                          }}
                          disabled={!isEffectiveActive}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className={`flex-1 ${!isEffectiveActive ? 'cursor-not-allowed opacity-50' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEffectiveActive) handleDelete(campaign);
                          }}
                          disabled={!isEffectiveActive}
                        >
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        className={`w-full ${!isEffectiveActive ? 'cursor-not-allowed opacity-50' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEffectiveActive) handleDonate(campaign);
                        }}
                        disabled={!isEffectiveActive}
                      >
                        {isExpired ? 'Expired' : isEffectiveActive ? 'Donate Now' : 'Closed'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter campaign title"
            required
            error={errors.title}
          />

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter campaign description"
              required
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.description
                ? 'border-red-500'
                : isDark
                  ? 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-[#4CAF50]'
                  : 'border-gray-300 focus:ring-[#4CAF50]'
                }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <Input
            label="Goal Amount"
            name="goalAmount"
            type="number"
            value={formData.goalAmount}
            onChange={handleChange}
            placeholder="Enter goal amount"
            required
            error={errors.goalAmount}
            min="1"
            step="0.01"
          />

          <Input
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            required
            error={errors.deadline}
          />

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCampaign ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Campaign"
        size="sm"
      >
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
          Are you sure you want to delete "{campaignToDelete?.title}"? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Donate Modal */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        title={`Donate to ${selectedCampaign?.title || 'Campaign'}`}
      >
        <form onSubmit={handleDonateSubmit}>
          <Input
            label="Amount"
            name="amount"
            type="number"
            value={donateFormData.amount}
            onChange={handleDonateChange}
            placeholder="Enter donation amount"
            required
            min="1"
            step="0.01"
          />

          <Select
            label="Donation Type"
            name="donationType"
            value={donateFormData.donationType}
            onChange={handleDonateChange}
            options={[
              { value: 'Zakat', label: 'Zakat' },
              { value: 'Sadqah', label: 'Sadqah' },
              { value: 'Fitra', label: 'Fitra' },
              { value: 'General', label: 'General' }
            ]}
            required
          />

          <Select
            label="Category"
            name="campaign"
            value={donateFormData.campaign}
            onChange={handleDonateChange}
            options={[
              { value: 'Food', label: 'Food' },
              { value: 'Education', label: 'Education' },
              { value: 'Medical', label: 'Medical' }
            ]}
            required
          />

          <Select
            label="Payment Method"
            name="paymentMethod"
            value={donateFormData.paymentMethod}
            onChange={handleDonateChange}
            options={[
              { value: 'Online', label: 'Online' },
              { value: 'Bank', label: 'Bank Transfer' },
              { value: 'Cash', label: 'Cash' }
            ]}
            required
          />

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDonateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Donate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Campaigns

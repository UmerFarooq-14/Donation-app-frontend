import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSingleCampaign } from '../api/campaignApi'
import { getAllDonationsAdmin } from '../api/donationApi'
import useThemeStore from '../store/themeStore'
import useAuthStore from '../store/authStore'
import Button from '../components/Button'

const CampaignDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const theme = useThemeStore((state) => state.theme)
    const isAdmin = useAuthStore((state) => state.isAdmin())
    const isDark = theme === 'dark'

    const [campaign, setCampaign] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [calculatedRaised, setCalculatedRaised] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                // 1. Fetch Campaign
                const data = await getSingleCampaign(id)
                const campaignObj = data.campaign || data
                setCampaign(campaignObj)

                // 2. Fetch Donations for Calculation (Only if Admin, or if we want to support it for all)
                // Validating user rule: "USER: Sees progress bar ONLY if already allowed elsewhere" 
                // Since we hide it for users, we might technically skip this, but for robustness we follow standard pattern.
                // However, the user API might not allow getAllDonationsAdmin. 
                // So we only fetch valid donations if we are Admin to avoid 403s.
                let raised = campaignObj.currentAmount || 0; // Fallback

                if (isAdmin) {
                    try {
                        const donationData = await getAllDonationsAdmin()
                        const allDonations = Array.isArray(donationData) ? donationData : (donationData.donations || [])

                        // FILTER: Status === Verified AND Campaign matches
                        const verifiedDonations = allDonations.filter(d => {
                            const dCampaignId = d.campaignId?._id || d.campaignId || d.campaign
                            return (dCampaignId === id) && (d.status === 'Verified')
                        })

                        // SUM
                        raised = verifiedDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
                    } catch (dError) {
                        console.warn("Could not fetch admin donations for calculation", dError)
                    }
                }

                setCalculatedRaised(raised)

            } catch (err) {
                console.error("Error fetching campaign details:", err)
                setError("Failed to load campaign details. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchData()
        }
    }, [id, isAdmin])

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

    if (loading) {
        return (
            <div className={`flex justify-center items-center h-64 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Loading campaign details...
            </div>
        )
    }

    if (error || !campaign) {
        return (
            <div className="text-center py-10">
                <p className={`text-xl mb-4 ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                    {error || "Campaign not found"}
                </p>
                <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
            </div>
        )
    }

    const isActive = campaign.isActive !== false; // Default true if undefined

    // Check if deadline has passed (before today)
    const deadlineDate = new Date(campaign.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    const isExpired = deadlineDate < today;

    const isEffectiveActive = isActive && !isExpired;
    const progress = calculateProgress(calculatedRaised, campaign.goalAmount);

    return (
        <div className={`max-w-4xl mx-auto p-6 rounded-lg shadow-md ${isDark ? 'bg-slate-800 text-gray-100' : 'bg-white text-gray-800'} relative`}>
            {!isEffectiveActive && (
                <div className="absolute top-6 right-6 bg-gray-500 text-white px-3 py-1 rounded-md z-10 font-semibold shadow-sm uppercase tracking-wide">
                    {isExpired ? 'Expired Campaign' : 'Inactive Campaign'}
                </div>
            )}

            <Button onClick={() => navigate('/campaigns')} variant="secondary" className="mb-6">
                &larr; Back to Campaigns
            </Button>

            <div className={`flex flex-col md:flex-row gap-8 ${!isEffectiveActive ? 'opacity-75 grayscale pointer-events-none' : ''}`}>

                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{campaign.title}</h1>
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                            Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg bg-opacity-10 border ${!isActive ? 'bg-gray-400 border-gray-400' : 'bg-green-500 border-green-500'}`}>

                        {isAdmin ? (
                            <>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className={`text-2xl font-bold ${!isActive ? 'text-gray-500 dark:text-gray-200' : 'text-green-600 dark:text-green-400'}`}>
                                            {formatAmount(calculatedRaised)}
                                        </span>
                                        <span className={`ml-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-500'}`}>
                                            raised of {formatAmount(campaign.goalAmount)}
                                        </span>
                                    </div>
                                    <span className={`font-semibold ${!isActive ? 'text-gray-500 dark:text-gray-300' : 'text-green-600 dark:text-green-400'}`}>
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${!isActive ? 'bg-gray-500' : 'bg-green-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col">
                                <span className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Goal Amount</span>
                                <span className={`text-2xl font-bold ${!isActive ? 'text-gray-500 dark:text-gray-200' : 'text-green-600 dark:text-green-400'}`}>
                                    {formatAmount(campaign.goalAmount)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>About this campaign</h2>
                        <p className={`whitespace-pre-line leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
                            {campaign.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CampaignDetails

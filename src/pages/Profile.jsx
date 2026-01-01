import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import { getReq, putReq } from '../api'
import useAuthStore from '../store/authStore'

const Profile = () => {
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getReq('user/profile')
        if (response?.data) {
          const userData = response.data
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        } else if (user) {
          // Fallback to Zustand user data
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        // Fallback to Zustand user data
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateProfile = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    return newErrors
  }

  const validatePassword = () => {
    const newErrors = {}
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!formData.newPassword) newErrors.newPassword = 'New password is required'
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters'
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateProfile()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const response = await putReq('user/profile', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      })

      if (response?.data) {
        // Update Zustand store with new user data
        const token = useAuthStore.getState().token
        login(token, response.data.user || response.data)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Update failed. Please try again.'
      setErrors({ submit: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validatePassword()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    setErrors({})
    try {
      await putReq('user/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      toast.success('Password updated successfully!')
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Password update failed. Please check your current password.'
      setErrors({ submit: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'profile'
                ? 'border-b-2 border-[#E6F4EA] text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'password'
                ? 'border-b-2 border-[#E6F4EA] text-gray-800'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit}>
            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              error={errors.phone}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={user?.role || 'User'}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              error={errors.currentPassword}
            />

            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              error={errors.newPassword}
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
            />

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}

export default Profile


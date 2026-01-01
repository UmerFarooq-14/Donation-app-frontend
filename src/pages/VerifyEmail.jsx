import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { postReq } from '../api'
import Button from '../components/Button'
import useThemeStore from '../store/themeStore'

const VerifyEmail = () => {
    const { token } = useParams()
    const [status, setStatus] = useState('loading') // loading, success, error
    const [message, setMessage] = useState('')
    const theme = useThemeStore((state) => state.theme)
    const isDark = theme === 'dark'

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await postReq(`auth/verify-email/${token}`)
                if (response && response.status === 200) {
                    setStatus('success')
                    setMessage(response.data.message || 'Email verified successfully!')
                    toast.success('Email verified successfully!')
                } else {
                    setStatus('error')
                    setMessage('Verification failed. Please try again or contact support.')
                }
            } catch (error) {
                setStatus('error')
                const errorMessage = error?.response?.data?.message || 'Invalid or expired verification token.'
                setMessage(errorMessage)
                toast.error(errorMessage)
            }
        }

        if (token) {
            verifyToken()
        }
    }, [token])

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`w-full max-w-md p-8 rounded-lg shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="text-center">
                    <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Email Verification
                    </h1>

                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verifying your email, please wait...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <p className={`text-lg font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                {message}
                            </p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Your account is now fully activated. You can now log in to your account.
                            </p>
                            <Link to="/login" className="block">
                                <Button className="w-full">
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <p className={`text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                {message}
                            </p>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                The link may have expired or is invalid. Please try registering again or request a new verification link.
                            </p>
                            <Link to="/login" className="block">
                                <Button variant="secondary" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail

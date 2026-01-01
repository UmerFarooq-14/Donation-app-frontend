import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import Input from '../components/Input'
import Button from '../components/Button'
import { postReq } from '../api'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            setError('Email is required')
            return
        }

        setLoading(true)
        setError('')
        try {
            const response = await postReq('auth/forgetpassword', { email })
            if (response && response.status === 200) {
                toast.success(response.data.message || 'Reset link sent to your email')
                setEmail('')
            }
        } catch (err) {
            const message = err?.response?.data?.message || 'Something went wrong'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h1>
                    <p className="text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (error) setError('')
                            }}
                            placeholder="Enter your email"
                            required
                            error={error}
                        />

                        <Button
                            type="submit"
                            className="w-full mb-4"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Go back to{' '}
                            <Link to="/login" className="text-[#4CAF50] hover:underline font-medium">
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword

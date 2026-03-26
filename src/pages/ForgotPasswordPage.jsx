import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import Spinner from '../components/Spinner'

const STEPS = ['Email', 'Verify Code', 'New Password']

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ email: '', code: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSendEmail = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotSend({ email: form.email })
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotVerify({ email: form.email, code: form.code })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.resetPassword({ email: form.email, code: form.code, password: form.password, password_confirmation: form.password_confirmation })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="flex items-center px-8 py-4 border-b border-primary/10 bg-white">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl">eco</span>
          <h2 className="text-xl font-bold tracking-tight">OLMarketplace</h2>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8">

            {/* Success state */}
            {success ? (
              <div className="text-center">
                <div className="mx-auto size-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                </div>
                <h1 className="text-2xl font-extrabold mb-2">Password Reset!</h1>
                <p className="text-slate-500 mb-8">Your password has been successfully changed.</p>
                <Link to="/login" className="inline-flex items-center justify-center w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < step ? 'bg-primary border-primary text-white' : i === step ? 'border-primary text-primary' : 'border-slate-200 text-slate-400'}`}>
                        {i < step ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                      </div>
                      <span className={`text-xs hidden sm:block ${i === step ? 'text-primary font-semibold' : 'text-slate-400'}`}>{s}</span>
                      {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-slate-200'}`} />}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-8">
                  <div className="mx-auto size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                  </div>
                  <h1 className="text-2xl font-extrabold">
                    {step === 0 && 'Forgot Password?'}
                    {step === 1 && 'Enter Verification Code'}
                    {step === 2 && 'Set New Password'}
                  </h1>
                  <p className="text-slate-500 mt-1 text-sm">
                    {step === 0 && "Enter your email address and we'll send you a code."}
                    {step === 1 && `We sent a 6-digit code to ${form.email}`}
                    {step === 2 && 'Choose a strong new password.'}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                  </div>
                )}

                {/* Step 0: Email */}
                {step === 0 && (
                  <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-700">Email Address</span>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="juan@example.com" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                    <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 mt-2">
                      {loading ? <Spinner size="sm" /> : null}
                      {loading ? 'Sending…' : 'Send Reset Code'}
                    </button>
                  </form>
                )}

                {/* Step 1: Code */}
                {step === 1 && (
                  <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-700">6-digit Code</span>
                      <input name="code" value={form.code} onChange={handleChange} required maxLength={6} placeholder="123456" className="rounded-lg border-slate-200 bg-white h-11 px-4 text-center tracking-[0.5rem] text-xl font-bold focus:ring-primary focus:border-primary" />
                    </label>
                    <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 mt-2">
                      {loading ? <Spinner size="sm" /> : null}
                      {loading ? 'Verifying…' : 'Verify Code'}
                    </button>
                    <button type="button" onClick={() => setStep(0)} className="text-sm text-primary hover:underline text-center">
                      Use a different email
                    </button>
                  </form>
                )}

                {/* Step 2: New Password */}
                {step === 2 && (
                  <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-700">New Password</span>
                      <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" autoComplete="new-password" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-slate-700">Confirm New Password</span>
                      <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required placeholder="••••••••" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" autoComplete="new-password" />
                    </label>
                    <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 mt-2">
                      {loading ? <Spinner size="sm" /> : null}
                      {loading ? 'Resetting…' : 'Reset Password'}
                    </button>
                  </form>
                )}

                <p className="mt-6 text-center text-sm text-slate-500">
                  Remembered it?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">Back to Sign In</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

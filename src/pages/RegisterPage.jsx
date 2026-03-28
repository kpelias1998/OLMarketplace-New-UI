import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referral = searchParams.get('referral') || ''
  const position = searchParams.get('position') || ''
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    setLoading(true)
    try {
      await register({ ...form, ...(referral && { referral }), ...(position && { position: Number(position) }) })
      navigate('/')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setGlobalError(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (field) =>
    errors[field] ? <span className="text-xs text-red-500">{errors[field][0]}</span> : null

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <header className="flex items-center px-8 py-4 border-b border-primary/10 bg-white">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl">eco</span>
          <h2 className="text-xl font-bold tracking-tight">OLMarketplace</h2>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
              </div>
              <h1 className="text-2xl font-extrabold">Create your account</h1>
              <p className="text-slate-500 mt-1">Join OLMarketplace today</p>
            </div>

            {globalError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {globalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">First Name</span>
                  <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="Juan" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" />
                  {fieldError('firstname')}
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-700">Last Name</span>
                  <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Dela Cruz" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" />
                  {fieldError('lastname')}
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Email Address *</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="juan@example.com" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" />
                {fieldError('email')}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Username *</span>
                <input name="username" value={form.username} onChange={handleChange} required placeholder="juandc" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" />
                {fieldError('username')}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Password *</span>
                <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" autoComplete="new-password" />
                {fieldError('password')}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Confirm Password *</span>
                <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required placeholder="••••••••" className="rounded-lg border-slate-200 bg-white h-11 px-4 focus:ring-primary focus:border-primary" autoComplete="new-password" />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {loading ? <Spinner size="sm" /> : null}
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

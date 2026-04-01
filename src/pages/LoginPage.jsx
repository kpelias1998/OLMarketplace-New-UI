import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Logo Header */}
      <header className="flex items-center px-8 py-4 border-b border-primary/10 bg-white">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <img src="/logo.png" alt="OLMarketplace" className="h-8 w-auto" />
          <h2 className="text-xl font-bold tracking-tight">OLMarketplace</h2>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-primary/10 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <h1 className="text-2xl font-extrabold">Welcome back</h1>
              <p className="text-slate-500 mt-1">Sign in to your OLMarketplace account</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">Email or Username</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="juan@example.com"
                  className="w-full rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary"
                  autoComplete="username"
                />
              </label>
              <label className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary"
                  autoComplete="current-password"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Spinner size="sm" /> : null}
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

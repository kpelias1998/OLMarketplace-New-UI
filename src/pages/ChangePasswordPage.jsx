import { useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { userApi } from '../api'

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.password_confirmation) {
      setError('Password confirmation does not match.')
      return
    }

    setSubmitting(true)
    try {
      await userApi.changePassword(form)
      setSuccess('Password changed successfully.')
      setForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountLayout title="Change Password" subtitle="Use a strong new password to keep your account secure.">
      <form onSubmit={onSubmit} className="max-w-2xl bg-white rounded-2xl border border-primary/10 p-6 md:p-8 space-y-5">
        {(error || success) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              error
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}
          >
            {error || success}
          </div>
        )}

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold text-slate-700">Current Password</span>
          <input
            type="password"
            name="current_password"
            value={form.current_password}
            onChange={onChange}
            required
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold text-slate-700">New Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold text-slate-700">Confirm New Password</span>
          <input
            type="password"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={onChange}
            required
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-bold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Spinner size="sm" />}
          Update Password
        </button>
      </form>
    </AccountLayout>
  )
}

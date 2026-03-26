import { useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { userApi } from '../api'

export default function ChangePinPage() {
  const [form, setForm] = useState({
    current_pin: '',
    pin: '',
    pin_confirmation: '',
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

    if (form.pin.length < 6) {
      setError('PIN must be at least 6 digits.')
      return
    }

    if (form.pin !== form.pin_confirmation) {
      setError('PIN confirmation does not match.')
      return
    }

    setSubmitting(true)
    try {
      await userApi.changePin(form)
      setSuccess('PIN changed successfully.')
      setForm({ current_pin: '', pin: '', pin_confirmation: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change PIN.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountLayout title="Change PIN" subtitle="Your checkout PIN is required for wallet purchases.">
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
          <span className="text-sm font-semibold text-slate-700">Current PIN</span>
          <input
            type="password"
            name="current_pin"
            value={form.current_pin}
            onChange={onChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold text-slate-700">New PIN</span>
          <input
            type="password"
            name="pin"
            value={form.pin}
            onChange={onChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <label className="space-y-1.5 block">
          <span className="text-sm font-semibold text-slate-700">Confirm New PIN</span>
          <input
            type="password"
            name="pin_confirmation"
            value={form.pin_confirmation}
            onChange={onChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-bold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Spinner size="sm" />}
          Update PIN
        </button>
      </form>
    </AccountLayout>
  )
}

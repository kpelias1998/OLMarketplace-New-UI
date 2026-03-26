import { useMemo, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { userApi } from '../api'
import { useAuth } from '../context/AuthContext'

function buildInitialForm(user) {
  const addressObj = typeof user?.address === 'object' && user?.address !== null ? user.address : {}
  return {
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    mobile: user?.mobile || '',
    country_code: user?.country_code || '',
    address: addressObj.address || '',
    city: addressObj.city || '',
    state: addressObj.state || '',
    zip: addressObj.zip || '',
    country: addressObj.country || '',
    beneficiary_name: user?.beneficiary_name || '',
  }
}

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState(() => buildInitialForm(user))
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ''), [imageFile])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => body.append(key, value ?? ''))
      if (imageFile) body.append('image', imageFile)

      await userApi.updateProfile(body)
      const infoRes = await userApi.info()
      const updatedUser = infoRes.data?.data || infoRes.data
      refreshUser(updatedUser)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AccountLayout title="Profile Settings" subtitle="Update your personal and delivery details.">
      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-primary/10 p-6 md:p-8 space-y-6">
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

        <div className="grid md:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">First Name</span>
            <input
              name="firstname"
              value={form.firstname}
              onChange={onChange}
              required
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Last Name</span>
            <input
              name="lastname"
              value={form.lastname}
              onChange={onChange}
              required
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Country Code</span>
            <input
              name="country_code"
              value={form.country_code}
              onChange={onChange}
              placeholder="+63"
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Mobile Number</span>
            <input
              name="mobile"
              value={form.mobile}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="md:col-span-2 space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Street Address</span>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">City</span>
            <input
              name="city"
              value={form.city}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">State / Province</span>
            <input
              name="state"
              value={form.state}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">ZIP Code</span>
            <input
              name="zip"
              value={form.zip}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Country</span>
            <input
              name="country"
              value={form.country}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="md:col-span-2 space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Beneficiary Name</span>
            <input
              name="beneficiary_name"
              value={form.beneficiary_name}
              onChange={onChange}
              className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
            />
          </label>

          <label className="md:col-span-2 space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Profile Image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-primary file:font-semibold"
            />
          </label>
        </div>

        {previewUrl && (
          <div className="rounded-xl border border-primary/10 p-4 inline-flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Image Preview</p>
            <img src={previewUrl} alt="Preview" className="h-24 w-24 rounded-xl object-cover" />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-bold hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting && <Spinner size="sm" />}
          Save Profile
        </button>
      </form>
    </AccountLayout>
  )
}

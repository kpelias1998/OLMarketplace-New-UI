import { useEffect, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { plansApi } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_LABEL = {
  1: { text: 'Active', style: 'bg-green-100 text-green-700' },
  0: { text: 'Inactive', style: 'bg-slate-100 text-slate-600' },
}

const PLAN_LABEL = {
  0: 'No Plan',
}

function getInitials(user) {
  const f = user?.firstname?.[0] || ''
  const l = user?.lastname?.[0] || ''
  return (f + l).toUpperCase() || (user?.username?.[0] || 'U').toUpperCase()
}

export default function MyReferralsPage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = window.location.origin
  const refLink1 = `${baseUrl}/register?referral=${user?.username || ''}&position=1`
  const refLink2 = `${baseUrl}/register?referral=${user?.username || ''}&position=2`

  function copyLink(link, key) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await plansApi.myReferral(page)
        const data = res.data?.data
        if (Array.isArray(data)) {
          setReferrals(data)
          setLastPage(1)
          setTotal(data.length)
        } else {
          setReferrals(data?.data || [])
          setLastPage(data?.last_page || 1)
          setTotal(data?.total || 0)
        }
      } catch {
        setError('Failed to load referrals.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  return (
    <AccountLayout
      title="My Referrals"
      subtitle="Users who registered using your referral link."
      rightAction={
        !loading && total > 0 ? (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
            <span className="material-symbols-outlined text-lg">group</span>
            <span className="text-sm font-extrabold">{total} Referral{total !== 1 ? 's' : ''}</span>
          </div>
        ) : null
      }
    >
      {/* Referral Links */}
      <section className="bg-white rounded-2xl border border-primary/10 p-5 mb-6 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">link</span>
          Your Referral Links
        </h3>
        {[{ label: 'Team A', link: refLink1, key: 1 }, { label: 'Team B', link: refLink2, key: 2 }].map(({ label, link, key }) => (
          <div key={key}>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">{label}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                disabled
                value={link}
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono cursor-default select-all focus:outline-none"
              />
              <button
                onClick={() => copyLink(link, key)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied === key ? 'check' : 'content_copy'}
                </span>
                {copied === key ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </section>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="bg-white rounded-2xl border border-primary/10 overflow-hidden">
          {referrals.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">group_off</span>
              <p className="font-semibold">No referrals yet.</p>
              <p className="text-sm text-slate-400 mt-1">Share your referral link to grow your network.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Member
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Username
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Plan
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((ref) => {
                      const status = STATUS_LABEL[ref.status] || { text: 'Unknown', style: 'bg-slate-100 text-slate-600' }
                      return (
                        <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-extrabold shrink-0 select-none">
                                {getInitials(ref)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {[ref.firstname, ref.lastname].filter(Boolean).join(' ') || ref.username}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-[180px]">{ref.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-600 font-semibold">
                            @{ref.username}
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-semibold">
                            {PLAN_LABEL[ref.plan_id] || (ref.plan_id > 0 ? `Plan #${ref.plan_id}` : 'No Plan')}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.style}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs">
                            {ref.created_at ? new Date(ref.created_at).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {referrals.map((ref) => {
                  const status = STATUS_LABEL[ref.status] || { text: 'Unknown', style: 'bg-slate-100 text-slate-600' }
                  return (
                    <div key={ref.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-extrabold shrink-0 select-none">
                        {getInitials(ref)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {[ref.firstname, ref.lastname].filter(Boolean).join(' ') || ref.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate">@{ref.username}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ref.plan_id > 0 ? `Plan #${ref.plan_id}` : 'No Plan'} •{' '}
                          {ref.created_at ? new Date(ref.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${status.style}`}>
                        {status.text}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
            Prev
          </button>
          <span className="text-sm text-slate-500 font-medium px-2">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      )}
    </AccountLayout>
  )
}

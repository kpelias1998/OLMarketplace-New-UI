import { useEffect, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { plansApi } from '../api'
import { useSettings } from '../context/SettingsContext'

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const BV_FILTER_OPTIONS = [
  { value: '', label: 'All BV' },
  { value: 'leftBV', label: 'Left BV' },
  { value: 'rightBV', label: 'Right BV' },
  { value: 'cutBV', label: 'Cut BV' },
  { value: 'paid', label: 'Paid BV' },
]

const POSITION_LABEL = { 1: 'Left', 2: 'Right' }

function StatCard({ icon, label, value, accent }) {
  return (
    <div className={`bg-white rounded-2xl border border-primary/10 p-5 flex items-center gap-4`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function BinarySummaryPage() {
  const { curSym } = useSettings()
  /* ─── Binary Summary ─────────────────────────────────────────── */
  const [summary, setSummary] = useState([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState('')

  /* ─── BV Log ─────────────────────────────────────────────────── */
  const [bvLog, setBvLog] = useState([])
  const [bvPage, setBvPage] = useState(1)
  const [bvLastPage, setBvLastPage] = useState(1)
  const [bvFilter, setBvFilter] = useState('')
  const [bvLoading, setBvLoading] = useState(true)
  const [bvError, setBvError] = useState('')

  /* ─── Binary Commission ──────────────────────────────────────── */
  const [commissions, setCommissions] = useState([])
  const [comPage, setComPage] = useState(1)
  const [comLastPage, setComLastPage] = useState(1)
  const [comLoading, setComLoading] = useState(true)
  const [comError, setComError] = useState('')

  /* ─── Active tab ─────────────────────────────────────────────── */
  const [tab, setTab] = useState('summary')

  /* ─── Load binary summary ────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setSummaryLoading(true)
      setSummaryError('')
      try {
        const res = await plansApi.binarySummary()
        setSummary(res.data?.data || [])
      } catch {
        setSummaryError('Failed to load binary summary.')
      } finally {
        setSummaryLoading(false)
      }
    }
    load()
  }, [])

  /* ─── Load BV log ────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setBvLoading(true)
      setBvError('')
      try {
        const params = { page: bvPage }
        if (bvFilter) params.type = bvFilter
        const res = await plansApi.bvLog(params)
        const data = res.data?.data
        if (Array.isArray(data)) {
          setBvLog(data)
          setBvLastPage(1)
        } else {
          setBvLog(data?.data || [])
          setBvLastPage(data?.last_page || 1)
        }
      } catch {
        setBvError('Failed to load BV log.')
      } finally {
        setBvLoading(false)
      }
    }
    if (tab === 'bvlog') load()
  }, [tab, bvPage, bvFilter])

  /* ─── Load binary commission ─────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setComLoading(true)
      setComError('')
      try {
        const res = await plansApi.binaryCommission(comPage)
        const data = res.data?.data
        if (Array.isArray(data)) {
          setCommissions(data)
          setComLastPage(1)
        } else {
          setCommissions(data?.data || [])
          setComLastPage(data?.last_page || 1)
        }
      } catch {
        setComError('Failed to load binary commissions.')
      } finally {
        setComLoading(false)
      }
    }
    if (tab === 'commission') load()
  }, [tab, comPage])

  /* ─── Totals from summary ────────────────────────────────────── */
  const totalLeftCount = summary.reduce((s, r) => s + (r.left_count || 0), 0)
  const totalRightCount = summary.reduce((s, r) => s + (r.right_count || 0), 0)
  const totalLeftBV = summary.reduce((s, r) => s + (r.left_bv || 0), 0)
  const totalRightBV = summary.reduce((s, r) => s + (r.right_bv || 0), 0)

  const TABS = [
    { id: 'summary', label: 'Group Summary', icon: 'account_tree' },
    { id: 'bvlog', label: 'BV Log', icon: 'bar_chart' },
    { id: 'commission', label: 'Binary Commission', icon: 'payments' },
  ]

  return (
    <AccountLayout
      title="Binary Summary"
      subtitle="Group sales summary, BV log, and binary commission history."
    >
      {/* Stat cards — always visible from summary data */}
      {!summaryLoading && !summaryError && summary.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="arrow_back" label="Left Members" value={totalLeftCount} accent="bg-blue-50 text-blue-600" />
          <StatCard icon="arrow_forward" label="Right Members" value={totalRightCount} accent="bg-purple-50 text-purple-600" />
          <StatCard icon="trending_up" label="Left BV" value={totalLeftBV.toLocaleString()} accent="bg-emerald-50 text-emerald-600" />
          <StatCard icon="trending_down" label="Right BV" value={totalRightBV.toLocaleString()} accent="bg-amber-50 text-amber-600" />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Group Summary tab ─────────────────────────────────────── */}
      {tab === 'summary' && (
        <>
          {summaryLoading && (
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          )}
          {summaryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {summaryError}
            </div>
          )}
          {!summaryLoading && !summaryError && summary.length === 0 && (
            <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-primary/10">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">account_tree</span>
              <p className="font-semibold">No group summary yet.</p>
              <p className="text-sm text-slate-400 mt-1">Subscribe to a plan to start building your binary tree.</p>
            </div>
          )}
          {!summaryLoading && !summaryError && summary.length > 0 && (
            <div className="space-y-4">
              {summary.map((row) => (
                <div key={row.id} className="bg-white rounded-2xl border border-primary/10 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Plan</p>
                      <p className="text-base font-extrabold text-slate-900">{row.plan?.name || `Plan #${row.plan_id}`}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      Since {row.created_at ? new Date(row.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left leg */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-blue-500 text-lg">arrow_back</span>
                        <p className="text-sm font-bold text-blue-700">Left Leg</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600 font-medium">Members</span>
                          <span className="text-base font-extrabold text-blue-900">{row.left_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600 font-medium">Total BV</span>
                          <span className="text-base font-extrabold text-blue-900">{(row.left_bv || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {(row.left_bv + row.right_bv) > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${Math.round((row.left_bv / (row.left_bv + row.right_bv)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-blue-500 font-semibold mt-1 text-right">
                            {Math.round((row.left_bv / (row.left_bv + row.right_bv)) * 100)}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right leg */}
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-purple-500 text-lg">arrow_forward</span>
                        <p className="text-sm font-bold text-purple-700">Right Leg</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-purple-600 font-medium">Members</span>
                          <span className="text-base font-extrabold text-purple-900">{row.right_count}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-purple-600 font-medium">Total BV</span>
                          <span className="text-base font-extrabold text-purple-900">{(row.right_bv || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {(row.left_bv + row.right_bv) > 0 && (
                        <div className="mt-3">
                          <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${Math.round((row.right_bv / (row.left_bv + row.right_bv)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-purple-500 font-semibold mt-1 text-right">
                            {Math.round((row.right_bv / (row.left_bv + row.right_bv)) * 100)}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── BV Log tab ───────────────────────────────────────────── */}
      {tab === 'bvlog' && (
        <>
          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {BV_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setBvFilter(opt.value); setBvPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  bvFilter === opt.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {bvLoading && (
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          )}
          {bvError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {bvError}
            </div>
          )}
          {!bvLoading && !bvError && (
            <section className="bg-white rounded-2xl border border-primary/10 overflow-hidden">
              {bvLog.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">bar_chart</span>
                  <p className="font-semibold">No BV log entries.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {bvLog.map((entry) => (
                    <div key={entry.id} className="px-5 py-4 flex items-center gap-4">
                      <span
                        className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          entry.trx_type === '+'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {entry.trx_type === '+' ? 'add' : 'remove'}
                        </span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {entry.details || 'BV Entry'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {POSITION_LABEL[entry.position] ? `${POSITION_LABEL[entry.position]} Leg` : '—'}
                          {entry.created_at ? ` • ${new Date(entry.created_at).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-extrabold text-sm ${
                            entry.trx_type === '+' ? 'text-green-700' : 'text-red-600'
                          }`}
                        >
                          {entry.trx_type === '+' ? '+' : '-'}{entry.amount} BV
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!bvLoading && bvLastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setBvPage((p) => Math.max(1, p - 1))}
                disabled={bvPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                Prev
              </button>
              <span className="text-sm text-slate-500 font-medium px-2">
                Page {bvPage} of {bvLastPage}
              </span>
              <button
                onClick={() => setBvPage((p) => Math.min(bvLastPage, p + 1))}
                disabled={bvPage === bvLastPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Binary Commission tab ─────────────────────────────────── */}
      {tab === 'commission' && (
        <>
          {comLoading && (
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          )}
          {comError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {comError}
            </div>
          )}
          {!comLoading && !comError && (
            <section className="bg-white rounded-2xl border border-primary/10 overflow-hidden">
              {commissions.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">payments</span>
                  <p className="font-semibold">No binary commissions yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Commissions are earned when your binary legs cycle.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {commissions.map((com) => (
                    <div key={com.id} className="px-5 py-4 flex items-center gap-4">
                      <span className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">payments</span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {com.details || 'Binary Commission'}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {com.trx}
                          {com.created_at ? ` • ${new Date(com.created_at).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-sm text-green-700">
                          +{formatMoney(com.amount)} {curSym}
                        </p>
                        <p className="text-xs text-slate-500">
                          Bal: {formatMoney(com.post_balance)} {curSym}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!comLoading && comLastPage > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setComPage((p) => Math.max(1, p - 1))}
                disabled={comPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
                Prev
              </button>
              <span className="text-sm text-slate-500 font-medium px-2">
                Page {comPage} of {comLastPage}
              </span>
              <button
                onClick={() => setComPage((p) => Math.min(comLastPage, p + 1))}
                disabled={comPage === comLastPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </AccountLayout>
  )
}

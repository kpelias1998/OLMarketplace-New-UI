import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { userApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useTrial } from '../context/TrialContext'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import AccountSidebar from '../components/AccountSidebar'

const TRX_ICONS = {
  '+': 'arrow_downward',
  '-': 'arrow_upward',
}

function QRCodeModal({ username, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-slate-900">My QR Code</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-inner">
            <QRCodeSVG value={String(username)} size={200} />
          </div>
          <p className="text-xs text-slate-400 font-medium">Username: <span className="font-bold text-slate-600">{username}</span></p>
        </div>
      </div>
    </div>
  )
}

export default function UserDashboardPage() {
  const { user, logout } = useAuth()
  const { curSym } = useSettings()
  const { hasPurchasedPlan, countdown, planCountdown } = useTrial()
  const navigate = useNavigate()
  const [sidebarOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const [userInfo, setUserInfo] = useState(null)
  const [totalAccumulated, setTotalAccumulated] = useState(null)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txPage, setTxPage] = useState(1)
  const [txLastPage, setTxLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [infoRes, dashRes, txRes] = await Promise.all([
          userApi.info(),
          userApi.dashboard(),
          userApi.transactions(txPage),
        ])
        setUserInfo(infoRes.data?.data || infoRes.data)
        setTotalAccumulated(parseFloat(infoRes.data?.data?.total_ref_com || 0) + parseFloat(infoRes.data?.data?.total_binary_com || 0) + parseFloat(infoRes.data?.data?.total_unilevel_com || 0))
        setStats(dashRes.data?.data || dashRes.data)
        const txData = txRes.data?.data || txRes.data
        let firstPageTx = []
        let lastPage = 1
        if (Array.isArray(txData)) {
          firstPageTx = txData
          setTransactions(txData)
        } else {
          firstPageTx = txData?.data || []
          lastPage = txData?.last_page || 1
          setTransactions(firstPageTx)
          setTxLastPage(lastPage)
        }
      } catch {
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, navigate, txPage])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const cur = curSym

  const fmt = (val) =>
    `${parseFloat(val || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AccountSidebar />

        {/* ── Page Content ────────────────────────────────── */}
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pt-16 lg:pt-8">

        {/* ── Welcome Header ─────────────────────────────────────── */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.firstname || user?.username}
            </h1>
            <p className="text-lg text-slate-500 mt-1.5 font-medium">
              Here's an overview of your account activity.
            </p>
          </div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 shrink-0"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            My Orders
          </Link>
        </section>

        {/* ── Plan Expiry Warning ─────────────────────────────────── */}
        {!loading && hasPurchasedPlan && planCountdown !== null && (() => {
          const totalSecs = Math.floor(planCountdown / 1000)
          const days = Math.floor(totalSecs / 86400)
          const hrs  = Math.floor((totalSecs % 86400) / 3600)
          const mins = Math.floor((totalSecs % 3600) / 60)
          const secs = totalSecs % 60
          const expired = planCountdown === 0
          const urgent = !expired && days < 7
          return (
            <section className={`mb-8 rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
              expired || urgent ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <span className={`material-symbols-outlined text-3xl shrink-0 ${
                expired || urgent ? 'text-red-500' : 'text-amber-500'
              }`}>
                {expired ? 'error' : 'event_busy'}
              </span>
              <div className="flex-1 min-w-0">
                {expired ? (
                  <>
                    <p className="font-extrabold text-base">Plan Expired</p>
                    <p className="text-sm mt-0.5 text-red-700">
                      Your active plan has expired. Renew to maintain your commissions and benefits.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-extrabold text-base">Plan Expiring Soon</p>
                    <p className="text-sm mt-0.5">
                      Your current plan expires in{' '}
                      <span className="font-bold tabular-nums">
                        {days > 0
                          ? `${days}d ${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`
                          : `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
                        }
                      </span>. Please top up your registration wallet.
                    </p>
                  </>
                )}
              </div>
              <a
                href="/plans"
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                  expired || urgent ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <span className="material-symbols-outlined text-base">workspace_premium</span>
                Renew Plan
              </a>
            </section>
          )
        })()}

        {/* ── Trial Countdown Warning ─────────────────────────────── */}
        {!loading && hasPurchasedPlan === false && countdown !== null && (
          <section className={`mb-8 rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
            countdown === 0
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <span className={`material-symbols-outlined text-3xl shrink-0 ${
              countdown === 0 ? 'text-red-500' : 'text-amber-500'
            }`}>
              {countdown === 0 ? 'error' : 'hourglass_top'}
            </span>
            <div className="flex-1 min-w-0">
              {countdown === 0 ? (
                <>
                  <p className="font-extrabold text-base">Trial Period Expired</p>
                  <p className="text-sm mt-0.5 text-red-700">
                    Your free trial has ended. Purchase a plan to continue enjoying full access.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-extrabold text-base">Free Trial Active</p>
                  <p className="text-sm mt-0.5">
                    You haven't purchased a plan yet. Your trial expires in{' '}
                    <span className="font-bold tabular-nums">
                      {String(Math.floor(countdown / (1000 * 60 * 60))).padStart(2, '0')}h{' '}
                      {String(Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0')}m{' '}
                      {String(Math.floor((countdown % (1000 * 60)) / 1000)).padStart(2, '0')}s
                    </span>.
                  </p>
                </>
              )}
            </div>
            {countdown > 0 && (
              <Link
                to="/plans"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors bg-amber-500 text-white hover:bg-amber-600"
              >
                <span className="material-symbols-outlined text-base">star</span>
                Get a Plan
              </Link>
            )}
          </section>
        )}

        {/* ── Loading ────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {!loading && (
          <>
          {/* ── Financial Stats ──────────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {/* Total Income Accumulated */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-green-100 text-primary rounded-lg">
                    <span className="material-symbols-outlined">payments</span>
                  </span>
                  {/* <span className="text-[10px] font-bold text-primary tracking-widest uppercase">OLPay</span> */}
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Total Income Accumulated</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(totalAccumulated)}
                </p>
              </div>

              {/* Total Referral Bonus */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <span className="material-symbols-outlined">payments</span>
                  </span>
                  {/* <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Wallet</span> */}
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Total Referral Bonus</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                 {fmt(userInfo?.total_ref_com)}
                </p>
              </div>

              {/* Total Matching Bonus */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <span className="material-symbols-outlined">payments</span>
                  </span>
                  {/* <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Total</span> */}
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Total Matching Bonus</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.total_binary_com)}
                </p>
              </div>

              {/* Total Campaign Rewards */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-rose-100 text-rose-500 rounded-lg">
                    <span className="material-symbols-outlined">payments</span>
                  </span>
                  {/* <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Total</span> */}
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Total Campaign Rewards</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.total_unilevel_com)}
                </p>
              </div>
            </section>
            {/* ── Withdrawal Status Row ─────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                <span className="p-3 bg-green-100 text-primary rounded-xl shrink-0">
                  <span className="material-symbols-outlined">check_circle</span>
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Approved</p>
                  <p className="text-2xl font-extrabold text-slate-900">{stats?.complete_withdraw ?? '—'}</p>
                  <p className="text-xs text-slate-400">Withdrawals</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                <span className="p-3 bg-yellow-100 text-yellow-600 rounded-xl shrink-0">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Pending</p>
                  <p className="text-2xl font-extrabold text-slate-900">{stats?.pending_withdraw ?? '—'}</p>
                  <p className="text-xs text-slate-400">Withdrawals</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 flex items-center gap-4 hover:shadow-md transition-all duration-200">
                <span className="p-3 bg-red-100 text-red-500 rounded-xl shrink-0">
                  <span className="material-symbols-outlined">cancel</span>
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Rejected</p>
                  <p className="text-2xl font-extrabold text-slate-900">{stats?.reject_withdraw ?? '—'}</p>
                  <p className="text-xs text-slate-400">Withdrawals</p>
                </div>
              </div>
            </section>

            {/* ── Main Bento Grid ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Recent Transactions ── 2/3 width */}
              <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-primary/5 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Recent Transactions</h2>
                  {txLastPage > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={txPage === 1}
                        onClick={() => setTxPage((p) => p - 1)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-500 disabled:opacity-30 transition-colors"
                        aria-label="Previous page"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                      </button>
                      <span className="text-xs text-slate-500 font-semibold tabular-nums">
                        {txPage} / {txLastPage}
                      </span>
                      <button
                        disabled={txPage === txLastPage}
                        onClick={() => setTxPage((p) => p + 1)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-500 disabled:opacity-30 transition-colors"
                        aria-label="Next page"
                      >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                      </button>
                    </div>
                  )}
                </div>

                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <span className="material-symbols-outlined text-slate-300 text-7xl">receipt</span>
                    <p className="font-semibold text-slate-500">No transactions yet</p>
                    <p className="text-sm text-slate-400">Your transaction history will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-primary/5">
                    {transactions.map((tx, i) => {
                      const isCredit = tx.trx_type === '+'
                      return (
                        <div
                          key={tx.id ?? `${tx.trx}-${i}`}
                          className="px-6 py-4 flex items-center gap-4 hover:bg-background-light/70 transition-colors"
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit ? 'bg-green-100 text-primary' : 'bg-red-100 text-red-500'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {TRX_ICONS[tx.trx_type] ?? 'swap_horiz'}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">
                              {tx.details || tx.remark || 'Transaction'}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {tx.trx}
                              {tx.created_at && (
                                <>
                                  {' '}•{' '}
                                  {new Date(tx.created_at).toLocaleDateString('en', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </>
                              )}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p
                              className={`font-extrabold text-sm ${
                                isCredit ? 'text-primary' : 'text-red-500'
                              }`}
                            >
                              {isCredit ? '+' : '-'}
                              {fmt(tx.amount)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Bal: {fmt(tx.post_balance)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Right Column ── 1/3 width */}
              <section className="space-y-6">

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-xl shrink-0 select-none">
                      {/* {initials} */}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-base text-slate-900 truncate">
                        {[user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      {user?.plan_id > 0 && (
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase rounded-full">
                          Active Plan
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setQrOpen(true)}
                    className="w-full mb-4 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">qr_code_2</span>
                    Show My QR Code
                  </button>

                  <div className="space-y-2.5 text-sm text-slate-500">
                    {user?.mobile && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">phone</span>
                        <span>{user.mobile}</span>
                      </div>
                    )}
                    {user?.address && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                        <span className="truncate">
                          {typeof user.address === 'object'
                            ? [user.address.address, user.address.city, user.address.state, user.address.zip, user.address.country].filter(Boolean).join(', ')
                            : user.address}
                        </span>
                      </div>
                    )}
                    {user?.username && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">alternate_email</span>
                        <span>{user.username}</span>
                      </div>
                    )}
                    {userInfo?.created_at && (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                        <span>Date Joined: {new Date(userInfo.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Featured Banner */}
                <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 20%, white 0%, transparent 60%)' }}
                  />
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
                      Marketplace
                    </span>
                    <h4 className="text-xl font-extrabold tracking-tight mb-2 leading-snug">
                      Discover New Products
                    </h4>
                    <p className="text-sm text-white/75 mb-5">
                      Explore our latest eco-friendly arrivals and exclusive deals.
                    </p>
                    <Link
                      to="/catalog"
                      className="inline-block px-4 py-2 bg-white text-primary font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors duration-200"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>

              </section>
            </div>
          </>
        )}
          </main>
        </div>
      </div>

      {qrOpen && user?.username && (
        <QRCodeModal username={user.username} onClose={() => setQrOpen(false)} />
      )}
    </div>
  )
}

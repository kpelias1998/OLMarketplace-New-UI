import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi, transferApi, withdrawApi, depositApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import AccountSidebar from '../components/AccountSidebar'

const TRX_ICONS = {
  '+': 'arrow_downward',
  '-': 'arrow_upward',
}

export default function OLPayPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen] = useState(false)

  const [userInfo, setUserInfo] = useState(null)
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txPage, setTxPage] = useState(1)
  const [txLastPage, setTxLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Balance Transfer state
  const [transferInfo, setTransferInfo] = useState(null)
  const [balWalletType, setBalWalletType] = useState('cash')
  const [balUsername, setBalUsername] = useState('')
  const [balAmount, setBalAmount] = useState('')
  const [balSearchStatus, setBalSearchStatus] = useState(null) // null | 'checking' | 'found' | 'notfound'
  const [balLoading, setBalLoading] = useState(false)
  const [balError, setBalError] = useState(null)
  const [balSuccess, setBalSuccess] = useState(null)

  // Merchant Transfer state
  const [merchantId, setMerchantId] = useState('')
  const [merchantAmount, setMerchantAmount] = useState('')
  const [merchantLoading, setMerchantLoading] = useState(false)
  const [merchantError, setMerchantError] = useState(null)
  const [merchantSuccess, setMerchantSuccess] = useState(null)

  // Deposit (Top Up) state
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [depositGateways, setDepositGateways] = useState([])
  const [depositGatewayId, setDepositGatewayId] = useState('')
  const [depositCurrencyId, setDepositCurrencyId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState(null)
  const [depositSuccess, setDepositSuccess] = useState(null) // { type, data }
  const topUpPanelRef = useRef(null)

  // Withdraw state
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawMethods, setWithdrawMethods] = useState([])
  const [withdrawMethodId, setWithdrawMethodId] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawError, setWithdrawError] = useState(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState(null)
  const withdrawPanelRef = useRef(null)

  // Wallet popup menus
  const [withdrawableMenuOpen, setWithdrawableMenuOpen] = useState(false)
  const [cashMenuOpen, setCashMenuOpen] = useState(false)
  const withdrawableMenuRef = useRef(null)
  const cashMenuRef = useRef(null)
  const transferFormRef = useRef(null)

  // Close popups on outside click
  useEffect(() => {
    const handler = (e) => {
      if (withdrawableMenuRef.current && !withdrawableMenuRef.current.contains(e.target)) {
        setWithdrawableMenuOpen(false)
      }
      if (cashMenuRef.current && !cashMenuRef.current.contains(e.target)) {
        setCashMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openTopUp = () => {
    setCashMenuOpen(false)
    setDepositSuccess(null)
    setDepositError(null)
    setDepositAmount('')
    setDepositGatewayId('')
    setDepositCurrencyId('')
    setTopUpOpen(true)
    setTimeout(() => topUpPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const selectedGateway = depositGateways.find((g) => String(g.id) === String(depositGatewayId))
  const selectedCurrency = selectedGateway?.currencies?.find((c) => String(c.id) === String(depositCurrencyId))
  const depositCharge = selectedCurrency && depositAmount
    ? parseFloat(selectedCurrency.fixed_charge || 0) + (parseFloat(depositAmount || 0) * parseFloat(selectedCurrency.percent_charge || 0) / 100)
    : null
  const depositTotal = depositCharge !== null
    ? parseFloat(depositAmount || 0) + depositCharge
    : null

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositError(null)
    setDepositSuccess(null)
    setDepositLoading(true)
    try {
      const res = await depositApi.insert({ currency_id: depositCurrencyId, amount: depositAmount })
      const d = res.data?.data || res.data
      const type = d?.type

      if (type === 'redirect') {
        // Open the payment gateway in a new tab
        window.open(d.redirect_url, '_blank', 'noopener,noreferrer')
        setDepositSuccess({ type, data: d })
      } else if (type === 'form_post') {
        // Programmatically submit a form to the gateway URL
        const form = document.createElement('form')
        form.method = d.method || 'POST'
        form.action = d.url
        form.target = '_blank'
        Object.entries(d.val || {}).forEach(([key, val]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = val
          form.appendChild(input)
        })
        document.body.appendChild(form)
        form.submit()
        document.body.removeChild(form)
        setDepositSuccess({ type, data: d })
      } else if (type === 'stripe_v3') {
        // Surface the session_id — Stripe.js integration handled externally
        setDepositSuccess({ type, data: d })
      } else {
        // manual or unknown — just show the receipt
        setDepositSuccess({ type: type || 'manual', data: d })
      }

      setDepositAmount('')
      setDepositGatewayId('')
      setDepositCurrencyId('')
    } catch (err) {
      setDepositError(err.response?.data?.message || 'Deposit failed. Please try again.')
    } finally {
      setDepositLoading(false)
    }
  }

  const openWithdraw = () => {
    setWithdrawableMenuOpen(false)
    setWithdrawSuccess(null)
    setWithdrawError(null)
    setWithdrawAmount('')
    setWithdrawMethodId('')
    setWithdrawOpen(true)
    setTimeout(() => withdrawPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setWithdrawError(null)
    setWithdrawSuccess(null)
    setWithdrawLoading(true)
    try {
      const res = await withdrawApi.store({ method_code: withdrawMethodId, amount: withdrawAmount })
      const d = res.data?.data || res.data
      setWithdrawSuccess(d)
      setWithdrawAmount('')
      setWithdrawMethodId('')
      const infoRes = await userApi.info()
      setUserInfo(infoRes.data?.data || infoRes.data)
    } catch (err) {
      setWithdrawError(err.response?.data?.message || 'Withdrawal failed. Please try again.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  const selectedMethod = withdrawMethods.find((m) => String(m.id) === String(withdrawMethodId))
  const withdrawCharge = selectedMethod && withdrawAmount
    ? parseFloat(selectedMethod.fixed_charge || 0) + (parseFloat(withdrawAmount || 0) * parseFloat(selectedMethod.percent_charge || 0) / 100)
    : null
  const withdrawAfterCharge = withdrawCharge !== null
    ? Math.max(0, parseFloat(withdrawAmount || 0) - withdrawCharge)
    : null

  const scrollToTransfer = (walletType) => {
    setBalWalletType(walletType)
    setCashMenuOpen(false)
    setWithdrawableMenuOpen(false)
    setTimeout(() => transferFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [infoRes, dashRes, txRes, transferRes] = await Promise.all([
          userApi.info(),
          userApi.dashboard(),
          userApi.transactions(txPage),
          transferApi.info(),
        ])
        setUserInfo(infoRes.data?.data || infoRes.data)
        setStats(dashRes.data?.data || dashRes.data)
        const txData = txRes.data?.data || txRes.data
        if (Array.isArray(txData)) {
          setTransactions(txData)
        } else {
          setTransactions(txData?.data || [])
          setTxLastPage(txData?.last_page || 1)
        }
        setTransferInfo(transferRes.data?.data || transferRes.data)
        const [methodsRes, gatewaysRes] = await Promise.all([
          withdrawApi.methods(),
          depositApi.methods(),
        ])
        setWithdrawMethods(methodsRes.data?.data || methodsRes.data || [])
        setDepositGateways(gatewaysRes.data?.data || gatewaysRes.data || [])
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

  // Debounced recipient search
  useEffect(() => {
    if (!balUsername.trim()) { setBalSearchStatus(null); return }
    setBalSearchStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const res = await transferApi.searchUser({ username: balUsername.trim() })
        setBalSearchStatus((res.data?.data?.found || res.data?.found) ? 'found' : 'notfound')
      } catch {
        setBalSearchStatus(null)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [balUsername])

  const handleBalanceTransfer = async (e) => {
    e.preventDefault()
    setBalError(null)
    setBalSuccess(null)
    if (balSearchStatus !== 'found') { setBalError('Please enter a valid recipient username.'); return }
    setBalLoading(true)
    try {
      const fn = balWalletType === 'cash' ? transferApi.cashWallet : transferApi.registration
      const res = await fn({ username: balUsername.trim(), amount: balAmount })
      const d = res.data?.data || res.data
      setBalSuccess(d)
      setBalUsername('')
      setBalAmount('')
      setBalSearchStatus(null)
      // refresh balances
      const infoRes = await userApi.info()
      setUserInfo(infoRes.data?.data || infoRes.data)
    } catch (err) {
      setBalError(err.response?.data?.message || 'Transfer failed. Please try again.')
    } finally {
      setBalLoading(false)
    }
  }

  const handleMerchantTransfer = async (e) => {
    e.preventDefault()
    setMerchantError(null)
    setMerchantSuccess(null)
    setMerchantLoading(true)
    try {
      const res = await transferApi.merchant({ merchant_id: merchantId, amount: merchantAmount })
      const d = res.data?.data || res.data
      setMerchantSuccess(d)
      setMerchantId('')
      setMerchantAmount('')
      // refresh balances
      const infoRes = await userApi.info()
      setUserInfo(infoRes.data?.data || infoRes.data)
    } catch (err) {
      setMerchantError(err.response?.data?.message || 'Transfer failed. Please try again.')
    } finally {
      setMerchantLoading(false)
    }
  }

  const cur = user?.currency?.sym || '₱'

  const fmt = (val) =>
    `${cur}${parseFloat(val || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AccountSidebar />

        {/* ── Page Content ────────────────────────────────── */}
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pt-16 lg:pt-8">

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
          {/* ── Wallet Balances ──────────────────────────────────── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {/* Withdrawable Wallet */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <span className="material-symbols-outlined">account_balance</span>
                  </span>
                  <div className="relative" ref={withdrawableMenuRef}>
                    <button
                      type="button"
                      onClick={() => setWithdrawableMenuOpen((o) => !o)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                      aria-label="Withdrawable wallet options"
                    >
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                    {withdrawableMenuOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={openWithdraw}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                          Withdraw
                        </button>
                        <Link
                          to="/transactions"
                          onClick={() => setWithdrawableMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">receipt_long</span>
                          View Transactions
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Withdrawable Wallet</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.w_balance)}
                </p>
              </div>

              {/* Cash Wallet */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <span className="material-symbols-outlined">paid</span>
                  </span>
                  <div className="relative" ref={cashMenuRef}>
                    <button
                      type="button"
                      onClick={() => setCashMenuOpen((o) => !o)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                      aria-label="Cash wallet options"
                    >
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                    {cashMenuOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden">
                        <button
                          type="button"
                          onClick={openTopUp}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">add_card</span>
                          Top Up
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollToTransfer('cash')}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">swap_horiz</span>
                          Transfer Balance
                        </button>
                        <Link
                          to="/transactions"
                          onClick={() => setCashMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">receipt_long</span>
                          View Transactions
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Cash Wallet</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.balance)}
                </p>
              </div>

              {/* Shopping Wallet */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-green-100 text-primary rounded-lg">
                    <span className="material-symbols-outlined">wallet</span>
                  </span>
                  <span className="text-[10px] font-bold text-primary tracking-widest uppercase">OLPay</span>
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Shopping Wallet</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.sw_balance)}
                </p>
              </div>
              {/* Registration Wallet */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5 flex flex-col hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                    <span className="material-symbols-outlined">how_to_reg</span>
                  </span>
                  <span className="text-[10px] font-bold text-violet-600 tracking-widest uppercase">Reg. Wallet</span>
                </div>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Registration Wallet</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {fmt(userInfo?.m_balance)}
                </p>
              </div>
             
            </section>

          
          {/* ── Top Up / Deposit Panel ────────────────────────────── */}
            {topUpOpen && (
              <div ref={topUpPanelRef} className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-primary/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">add_card</span>
                      Top Up — Cash Wallet
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Current balance: <span className="font-bold text-slate-700">{fmt(userInfo?.balance)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setTopUpOpen(false); setDepositSuccess(null); setDepositError(null) }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    aria-label="Close top up panel"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <form onSubmit={handleDeposit} className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Gateway + Currency selectors */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Payment Gateway
                        </label>
                        {depositGateways.length > 0 ? (
                          <select
                            value={depositGatewayId}
                            onChange={(e) => { setDepositGatewayId(e.target.value); setDepositCurrencyId(''); setDepositSuccess(null) }}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                            required
                          >
                            <option value="">— Select a gateway —</option>
                            {depositGateways.map((g) => (
                              <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-slate-400 italic">No payment gateways available.</p>
                        )}
                      </div>

                      {selectedGateway?.currencies?.length > 0 && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Currency
                          </label>
                          <select
                            value={depositCurrencyId}
                            onChange={(e) => { setDepositCurrencyId(e.target.value); setDepositSuccess(null) }}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                            required
                          >
                            <option value="">— Select currency —</option>
                            {selectedGateway.currencies.map((c) => (
                              <option key={c.id} value={c.id}>{c.currency} ({c.symbol})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Currency details chip */}
                      {selectedCurrency && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700 space-y-0.5">
                          <p>Limit: <span className="font-semibold">{selectedCurrency.symbol}{parseFloat(selectedCurrency.min_amount).toLocaleString('en', { minimumFractionDigits: 2 })}</span> – <span className="font-semibold">{selectedCurrency.symbol}{parseFloat(selectedCurrency.max_amount).toLocaleString('en', { minimumFractionDigits: 2 })}</span></p>
                          <p>Fee: <span className="font-semibold">{selectedCurrency.symbol}{parseFloat(selectedCurrency.fixed_charge || 0).toFixed(2)}</span> fixed + <span className="font-semibold">{selectedCurrency.percent_charge}%</span></p>
                        </div>
                      )}
                    </div>

                    {/* Amount + Fee Preview */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Amount
                        </label>
                        <input
                          type="number"
                          min={selectedCurrency?.min_amount || '0.01'}
                          max={selectedCurrency?.max_amount || undefined}
                          step="0.01"
                          value={depositAmount}
                          onChange={(e) => { setDepositAmount(e.target.value); setDepositSuccess(null) }}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                          required
                        />
                      </div>

                      {/* Live fee breakdown */}
                      {depositCharge !== null && depositAmount && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs space-y-1.5">
                          <div className="flex justify-between text-slate-500">
                            <span>Deposit amount</span>
                            <span className="font-semibold text-slate-700">{fmt(depositAmount)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Fee</span>
                            <span className="font-semibold text-red-500">+ {fmt(depositCharge)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-800">
                            <span>Total charged</span>
                            <span className="text-amber-600">{fmt(depositTotal)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {depositError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
                      <span className="material-symbols-outlined text-base">error</span>
                      {depositError}
                    </div>
                  )}

                  {depositSuccess && (() => {
                    const { type, data } = depositSuccess
                    const deposit = data?.deposit ?? data
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-xs space-y-2 mt-4">
                        <p className="font-bold text-green-700 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          Deposit Initiated
                        </p>
                        <p className="text-slate-600">
                          Amount: <span className="font-semibold">{fmt(deposit?.amount)}</span>
                          {' '}· Fee: <span className="font-semibold">{fmt(deposit?.charge)}</span>
                          {' '}· Total: <span className="font-semibold">{fmt(deposit?.final_amo)}</span>
                        </p>
                        <p className="text-slate-400">Ref: {deposit?.trx}</p>

                        {type === 'redirect' && (
                          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">open_in_new</span>
                            <span>
                              A new tab has opened for payment. Once complete, your balance will be updated automatically.
                              {' '}<a href={data.redirect_url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Click here</a> if it did not open.
                            </span>
                          </div>
                        )}

                        {type === 'form_post' && (
                          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-700">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">open_in_new</span>
                            <span>You were redirected to the payment gateway. Complete the payment in the new tab.</span>
                          </div>
                        )}

                        {type === 'stripe_v3' && (
                          <div className="flex items-start gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-violet-700">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">credit_card</span>
                            <span>
                              Stripe session ready.{' '}
                              <span className="font-semibold">Session ID:</span> <span className="font-mono break-all">{data?.session_id}</span>
                            </span>
                          </div>
                        )}

                        {type === 'manual' && (
                          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700">
                            <span className="material-symbols-outlined text-base shrink-0 mt-0.5">upload_file</span>
                            <span>This is a manual gateway. Please submit your payment proof to complete the deposit.</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex items-center gap-3 mt-5">
                    <button
                      type="submit"
                      disabled={depositLoading || !depositCurrencyId || !depositGateways.length}
                      className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {depositLoading
                        ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Processing…</>
                        : <><span className="material-symbols-outlined text-base">add_card</span> Submit Deposit</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTopUpOpen(false); setDepositSuccess(null); setDepositError(null) }}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

          {/* ── Withdraw Panel ────────────────────────────────────── */}
            {withdrawOpen && (
              <div ref={withdrawPanelRef} className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-primary/5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600">account_balance_wallet</span>
                      Withdraw Funds
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Available: <span className="font-bold text-slate-700">{fmt(userInfo?.w_balance)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setWithdrawOpen(false); setWithdrawSuccess(null); setWithdrawError(null) }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    aria-label="Close withdraw panel"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                <form onSubmit={handleWithdraw} className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Method Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Withdraw Method
                      </label>
                      {withdrawMethods.length > 0 ? (
                        <select
                          value={withdrawMethodId}
                          onChange={(e) => { setWithdrawMethodId(e.target.value); setWithdrawSuccess(null) }}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                          required
                        >
                          <option value="">— Select a method —</option>
                          {withdrawMethods.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.currency})</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No withdrawal methods available.</p>
                      )}

                      {/* Method details */}
                      {selectedMethod && (
                        <div className="mt-2.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 space-y-0.5">
                          <p>Limit: <span className="font-semibold">{fmt(selectedMethod.min_limit)}</span> – <span className="font-semibold">{fmt(selectedMethod.max_limit)}</span></p>
                          <p>Fee: <span className="font-semibold">{fmt(selectedMethod.fixed_charge)}</span> fixed + <span className="font-semibold">{selectedMethod.percent_charge}%</span></p>
                          {selectedMethod.description && <p className="text-blue-500">{selectedMethod.description}</p>}
                        </div>
                      )}
                    </div>

                    {/* Amount + Fee Preview */}
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Amount
                        </label>
                        <input
                          type="number"
                          min={selectedMethod?.min_limit || '0.01'}
                          max={selectedMethod?.max_limit || undefined}
                          step="0.01"
                          value={withdrawAmount}
                          onChange={(e) => { setWithdrawAmount(e.target.value); setWithdrawSuccess(null) }}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                          required
                        />
                      </div>

                      {/* Live fee breakdown */}
                      {withdrawCharge !== null && withdrawAmount && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs space-y-1.5">
                          <div className="flex justify-between text-slate-500">
                            <span>Amount requested</span>
                            <span className="font-semibold text-slate-700">{fmt(withdrawAmount)}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Fee</span>
                            <span className="font-semibold text-red-500">- {fmt(withdrawCharge)}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-800">
                            <span>You receive</span>
                            <span className="text-primary">{fmt(withdrawAfterCharge)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {withdrawError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
                      <span className="material-symbols-outlined text-base">error</span>
                      {withdrawError}
                    </div>
                  )}

                  {withdrawSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-xs space-y-1 mt-4">
                      <p className="font-bold text-green-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Withdrawal Request Submitted
                      </p>
                      <p className="text-slate-600">Amount: <span className="font-semibold">{fmt(withdrawSuccess.amount)}</span> · Fee: <span className="font-semibold">{fmt(withdrawSuccess.charge)}</span> · You receive: <span className="font-semibold">{fmt(withdrawSuccess.final_amount)}</span></p>
                      <p className="text-slate-400">Ref: {withdrawSuccess.trx} · Status: Pending admin approval</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-5">
                    <button
                      type="submit"
                      disabled={withdrawLoading || !withdrawMethods.length}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {withdrawLoading
                        ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Submitting…</>
                        : <><span className="material-symbols-outlined text-base">account_balance_wallet</span> Submit Withdrawal</>
                      }
                    </button>
                    <button
                      type="button"
                      onClick={() => { setWithdrawOpen(false); setWithdrawSuccess(null); setWithdrawError(null) }}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

          {/* ── Balance & Merchant Transfer ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Balance Transfer */}
              <div ref={transferFormRef} className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-primary/5">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">swap_horiz</span>
                    Balance Transfer
                  </h2>
                  {transferInfo && (
                    <p className="text-xs text-slate-400 mt-1">
                      Fee: {fmt(transferInfo.bal_trans_fixed_charge)} fixed + {transferInfo.bal_trans_per_charge}% per transfer
                    </p>
                  )}
                </div>

                <form onSubmit={handleBalanceTransfer} className="p-6 space-y-4">
                  {/* Wallet Type Tabs */}
                  <div className="flex rounded-lg overflow-hidden border border-primary/15">
                    <button
                      type="button"
                      onClick={() => { setBalWalletType('cash'); setBalSuccess(null); setBalError(null) }}
                      className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${
                        balWalletType === 'cash'
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-500 hover:bg-primary/5'
                      }`}
                    >
                      Cash Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => { setBalWalletType('registration'); setBalSuccess(null); setBalError(null) }}
                      className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${
                        balWalletType === 'registration'
                          ? 'bg-primary text-white'
                          : 'bg-white text-slate-500 hover:bg-primary/5'
                      }`}
                    >
                      Reg. Wallet
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 font-medium">
                    Available:{' '}
                    <span className="font-bold text-slate-700">
                      {balWalletType === 'cash' ? fmt(userInfo?.balance) : fmt(userInfo?.m_balance)}
                    </span>
                  </div>

                  {/* Recipient */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Recipient Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={balUsername}
                        onChange={(e) => { setBalUsername(e.target.value); setBalSuccess(null) }}
                        placeholder="Enter username or email"
                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base material-symbols-outlined">
                        {balSearchStatus === 'checking' && <span className="text-slate-400 animate-spin text-base">progress_activity</span>}
                        {balSearchStatus === 'found' && <span className="text-primary text-base">check_circle</span>}
                        {balSearchStatus === 'notfound' && <span className="text-red-500 text-base">cancel</span>}
                      </span>
                    </div>
                    {balSearchStatus === 'notfound' && (
                      <p className="text-xs text-red-500 mt-1">User not found.</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={balAmount}
                      onChange={(e) => { setBalAmount(e.target.value); setBalSuccess(null) }}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      required
                    />
                  </div>

                  {balError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      {balError}
                    </div>
                  )}

                  {balSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-xs space-y-1">
                      <p className="font-bold text-green-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Transfer Successful
                      </p>
                      <p className="text-slate-600">Sent <span className="font-semibold">{fmt(balSuccess.amount)}</span> to <span className="font-semibold">@{balSuccess.recipient}</span></p>
                      <p className="text-slate-500">Fee: {fmt(balSuccess.charge)} · New balance: {fmt(balSuccess.post_balance)}</p>
                      <p className="text-slate-400">Ref: {balSuccess.trx}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={balLoading || balSearchStatus !== 'found'}
                    className="w-full py-2.5 bg-primary text-white font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {balLoading
                      ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Sending…</>
                      : <><span className="material-symbols-outlined text-base">send</span> Send Transfer</>
                    }
                  </button>
                </form>
              </div>

              {/* Merchant Transfer */}
              <div className="bg-white rounded-xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="px-6 py-5 border-b border-primary/5">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">storefront</span>
                    Merchant Transfer
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pay a merchant using your Shopping Wallet
                  </p>
                </div>

                <form onSubmit={handleMerchantTransfer} className="p-6 space-y-4">
                  <div className="text-xs text-slate-400 font-medium">
                    Shopping Wallet:{' '}
                    <span className="font-bold text-slate-700">{fmt(userInfo?.sw_balance)}</span>
                  </div>

                  {/* Merchant Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Select Merchant
                    </label>
                    {transferInfo?.merchants?.length > 0 ? (
                      <select
                        value={merchantId}
                        onChange={(e) => { setMerchantId(e.target.value); setMerchantSuccess(null) }}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
                        required
                      >
                        <option value="">— Choose a merchant —</option>
                        {transferInfo.merchants.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} 
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No merchants available.</p>
                    )}
                  </div>

                  {/* Discount preview */}
                  {merchantId && transferInfo?.merchants && (() => {
                    const m = transferInfo.merchants.find((x) => String(x.id) === String(merchantId))
                    return m ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                        Merchant receives <span className="font-bold">{100 - m.discount_percentage}%</span> of your transfer. The <span className="font-bold">{m.discount_percentage}%</span> discount is distributed as network rewards.
                      </div>
                    ) : null
                  })()}

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={merchantAmount}
                      onChange={(e) => { setMerchantAmount(e.target.value); setMerchantSuccess(null) }}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                      required
                    />
                  </div>

                  {merchantError && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      {merchantError}
                    </div>
                  )}

                  {merchantSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-xs space-y-1">
                      <p className="font-bold text-green-700 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">check_circle</span>
                        Transfer Successful
                      </p>
                      <p className="text-slate-600">
                        Sent <span className="font-semibold">{fmt(merchantSuccess.amount)}</span> to <span className="font-semibold">{merchantSuccess.merchant}</span>
                      </p>
                      <p className="text-slate-500">
                        Merchant received: {fmt(merchantSuccess.merchant_received)} · Discount: {merchantSuccess.discount_percentage}% ({fmt(merchantSuccess.discount)})
                      </p>
                      <p className="text-slate-500">New balance: {fmt(merchantSuccess.post_balance)}</p>
                      <p className="text-slate-400">Ref: {merchantSuccess.trx}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={merchantLoading || !transferInfo?.merchants?.length}
                    className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-lg text-sm hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {merchantLoading
                      ? <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span> Sending…</>
                      : <><span className="material-symbols-outlined text-base">storefront</span> Pay Merchant</>
                    }
                  </button>
                </form>
              </div>

            </div>
          
          </>
        )}
          </main>
        </div>
      </div>
    </div>
  )
}

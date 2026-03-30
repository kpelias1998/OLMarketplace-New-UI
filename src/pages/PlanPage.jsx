import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { plansApi, userApi } from '../api'
import { useSettings } from '../context/SettingsContext'
import { useTrial } from '../context/TrialContext'

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function SubscribeModal({ plan, onClose, onSuccess }) {
  const { curSym } = useSettings()
  const [voucher, setVoucher] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = { plan_id: plan.id }
      if (voucher.trim()) payload.voucher = voucher.trim()
      await plansApi.subscribe(payload)
      onSuccess(plan.id, plan.name)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[Object.keys(err?.response?.data?.errors || {})[0]]?.[0] ||
          'Subscription failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-slate-900">Subscribe to {plan.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Plan Cost</span>
            <span className="font-extrabold text-primary">{formatMoney(plan.price)} {curSym}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Business Volume (BV)</span>
            <span className="font-semibold text-slate-800">{plan.bv} BV</span>
          </div>
          {plan.tree_com > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Tree Commission</span>
              <span className="font-semibold text-slate-800">{formatMoney(plan.tree_com)} {curSym}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Cost will be deducted from your Registration Wallet (m_balance).
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Voucher Code <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Enter voucher code"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Subscribing…' : 'Confirm Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlanPage() {
  const { curSym } = useSettings()
  const { trialExpired, refreshTrial, hasPurchasedPlan, planCountdown, activePlanId } = useTrial()
  const planExpired = hasPurchasedPlan && planCountdown === 0
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [subscribedPlanIds, setSubscribedPlanIds] = useState(new Set())

  useEffect(() => {
    if (trialExpired) navigate('/dashboard', { replace: true })
  }, [trialExpired, navigate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      // Load plans first — surface error if this fails
      try {
        const plansRes = await plansApi.list()
        setPlans(plansRes.data?.data || [])
      } catch {
        setError('Failed to load plans.')
        setLoading(false)
        return
      }

      // Load transactions independently so a failure here never hides plans
      try {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        const allTx = []
        let page = 1
        let lastPage = 1
        do {
          const res = await userApi.transactions(page)
          const data = res.data?.data || res.data
          const txs = Array.isArray(data) ? data : (data?.data || [])
          lastPage = Array.isArray(data) ? 1 : (data?.last_page || 1)
          allTx.push(...txs)
          page++
        } while (page <= lastPage)

        const ids = new Set(
          allTx
            .filter((tx) => {
              return (
                tx.remark === 'purchased_plan' &&
                tx.plan_id != null &&
                tx.created_at &&
                new Date(tx.created_at) >= oneYearAgo
              )
            })
            .map((tx) => Number(tx.plan_id))
        )
        setSubscribedPlanIds(ids)
      } catch {
        // Transaction fetch failed — plans still show, subscribed badges silently skipped
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSuccess = (planId, planName) => {
    setSelectedPlan(null)
    setSubscribedPlanIds((prev) => new Set([...prev, Number(planId)]))
    setSuccessMsg(`Successfully subscribed to ${planName}!`)
    setTimeout(() => setSuccessMsg(''), 4000)
    refreshTrial()
  }

  return (
    <AccountLayout
      title="Plans"
      subtitle="Choose a subscription plan to unlock Business Volume and commissions."
    >
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {successMsg}
        </div>
      )}

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

      {!loading && !error && plans.length === 0 && (
        <div className="py-20 text-center text-slate-500 bg-white rounded-2xl border border-primary/10">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">inventory_2</span>
          <p className="font-semibold">No plans available.</p>
          <p className="text-sm text-slate-400 mt-1">Check back later for available subscription plans.</p>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-primary/10 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Plan header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
                  {plan.type === 1 ? 'Package Plan' : 'Regular Plan'}
                </p>
                <h2 className="text-2xl font-extrabold">{plan.name}</h2>
                <p className="text-3xl font-extrabold mt-2">
                  {formatMoney(plan.price)} {curSym}
                </p>
              </div>

              {/* Plan details */}
              <div className="px-6 py-5 flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Business Volume</p>
                    <p className="text-sm font-extrabold text-slate-800">{plan.bv} BV</p>
                  </div>
                </div>

                {plan.tree_com > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">account_tree</span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Tree Commission</p>
                      <p className="text-sm font-extrabold text-slate-800">
                        {formatMoney(plan.tree_com)} {curSym}
                        {plan.tree_com_limit > 0 && (
                          <span className="text-slate-500 font-normal ml-1">
                            ({plan.tree_com_limit} levels)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {plan.indirectref_com > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">share</span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Indirect Referral Commission</p>
                      <p className="text-sm font-extrabold text-slate-800">{formatMoney(plan.indirectref_com)} {curSym}</p>
                    </div>
                  </div>
                )}

                {/* {plan.prerequisites && plan.prerequisites.length > 0 && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">warning</span>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Prerequisites</p>
                      <p className="text-sm font-semibold text-amber-700">
                        Plan IDs required: {plan.prerequisites.join(', ')}
                      </p>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="px-6 pb-6">
                {subscribedPlanIds.has(plan.id) ? (
                  <button
                    disabled
                    className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white cursor-default flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Subscribed
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-colors ${
                      planExpired && Number(plan.id) === activePlanId
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    {planExpired && Number(plan.id) === activePlanId ? 'Upgrade Now' : 'Subscribe Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlan && (
        <SubscribeModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </AccountLayout>
  )
}

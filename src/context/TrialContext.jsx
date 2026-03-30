import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { userApi, plansApi } from '../api'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'

const PLAN_WARN_MS = 60 * 24 * 60 * 60 * 1000 // 60 days

const TrialContext = createContext({
  hasPurchasedPlan: null,
  countdown: null,
  trialExpired: false,
  planCountdown: null,
  activePlanId: null,
  refreshTrial: () => {},
})

export function TrialProvider({ children }) {
  const { user } = useAuth()
  const { trialLimitHours } = useSettings()
  const [userCreatedAt, setUserCreatedAt] = useState(null)
  const [hasPurchasedPlan, setHasPurchasedPlan] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const [planExpiryMs, setPlanExpiryMs] = useState(null)
  const [planCountdown, setPlanCountdown] = useState(null)
  const [activePlanId, setActivePlanId] = useState(null)

  const checkTrial = useCallback(async () => {
    if (!user) {
      setHasPurchasedPlan(null)
      setUserCreatedAt(null)
      setCountdown(null)
      setPlanExpiryMs(null)
      setActivePlanId(null)
      return
    }
    try {
      const [infoRes, txRes] = await Promise.all([
        userApi.info(),
        userApi.transactions(1),
      ])
      const info = infoRes.data?.data || infoRes.data
      setUserCreatedAt(info?.created_at || null)

      const txData = txRes.data?.data || txRes.data
      let firstPageTx = []
      let lastPage = 1
      if (Array.isArray(txData)) {
        firstPageTx = txData
      } else {
        firstPageTx = txData?.data || []
        lastPage = txData?.last_page || 1
      }

      // Scan pages in order — stop at the first purchased_plan tx (newest-first order)
      let mostRecentPurchaseTx = firstPageTx.find((tx) => tx.remark?.toLowerCase().includes('purchased_plan')) || null
      if (!mostRecentPurchaseTx && lastPage > 1) {
        for (let p = 2; p <= lastPage; p++) {
          const pageRes = await userApi.transactions(p)
          const pageData = pageRes.data?.data || pageRes.data
          const pageTx = Array.isArray(pageData) ? pageData : (pageData?.data || [])
          const found = pageTx.find((tx) => tx.remark?.toLowerCase().includes('purchased_plan'))
          if (found) { mostRecentPurchaseTx = found; break }
        }
      }

      const foundPlan = mostRecentPurchaseTx !== null
      setHasPurchasedPlan(foundPlan)

      // Compute plan expiry from the most recent subscription + plan lifespan
      if (foundPlan && mostRecentPurchaseTx.plan_id && mostRecentPurchaseTx.created_at) {
        setActivePlanId(Number(mostRecentPurchaseTx.plan_id))
        try {
          const plansRes = await plansApi.list()
          const plans = plansRes.data?.data || []
          const plan = plans.find((pl) => Number(pl.id) === Number(mostRecentPurchaseTx.plan_id))
          if (plan?.lifespan) {
            setPlanExpiryMs(
              new Date(mostRecentPurchaseTx.created_at).getTime() + Number(plan.lifespan) * 24 * 60 * 60 * 1000
            )
          } else {
            setPlanExpiryMs(null)
          }
        } catch {
          setPlanExpiryMs(null)
        }
      } else {
        setPlanExpiryMs(null)
        setActivePlanId(null)
      }
    } catch {
      // silently fail — never block the UI
    }
  }, [user])

  useEffect(() => {
    checkTrial()
  }, [checkTrial])

  // Countdown timer — only active while trial is unresolved and within limit
  useEffect(() => {
    if (hasPurchasedPlan || hasPurchasedPlan === null) {
      setCountdown(null)
      return
    }
    if (!userCreatedAt || !trialLimitHours) return
    const deadline = new Date(userCreatedAt).getTime() + trialLimitHours * 60 * 60 * 1000
    const tick = () => setCountdown(Math.max(0, deadline - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [hasPurchasedPlan, userCreatedAt, trialLimitHours])

  // Plan expiry countdown — only shown in the last 60 days before expiry
  useEffect(() => {
    if (!planExpiryMs) {
      setPlanCountdown(null)
      return
    }
    const tick = () => {
      const remaining = Math.max(0, planExpiryMs - Date.now())
      setPlanCountdown(remaining <= PLAN_WARN_MS ? remaining : null)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [planExpiryMs])

  const trialExpired = hasPurchasedPlan === false && countdown === 0

  return (
    <TrialContext.Provider value={{ hasPurchasedPlan, countdown, trialExpired, planCountdown, activePlanId, refreshTrial: checkTrial }}>
      {children}
    </TrialContext.Provider>
  )
}

export const useTrial = () => useContext(TrialContext)

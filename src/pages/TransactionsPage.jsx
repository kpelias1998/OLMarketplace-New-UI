import { useEffect, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { userApi } from '../api'

const TRX_LABEL = {
  '+': { text: 'Credit', style: 'bg-green-100 text-green-700', icon: 'arrow_downward' },
  '-': { text: 'Debit', style: 'bg-red-100 text-red-700', icon: 'arrow_upward' },
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await userApi.transactions(page)
        const data = res.data?.data || res.data
        if (Array.isArray(data)) {
          setTransactions(data)
          setLastPage(1)
        } else {
          setTransactions(data?.data || [])
          setLastPage(data?.last_page || 1)
        }
      } catch {
        setError('Failed to load transactions.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  return (
    <AccountLayout title="Transactions" subtitle="Wallet credits and debits from your account history.">
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
          {transactions.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <p className="font-semibold">No transactions yet.</p>
              <p className="text-sm text-slate-400 mt-1">Your wallet records will show here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const type = TRX_LABEL[tx.trx_type] || {
                  text: 'Record',
                  style: 'bg-slate-100 text-slate-700',
                  icon: 'swap_horiz',
                }
                return (
                  <div key={tx.id || tx.trx} className="px-5 py-4 flex items-center gap-4">
                    <span className={`h-10 w-10 rounded-full flex items-center justify-center ${type.style}`}>
                      <span className="material-symbols-outlined text-lg">{type.icon}</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{tx.details || 'Transaction'}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {tx.trx}
                        {tx.created_at ? ` • ${new Date(tx.created_at).toLocaleString()}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-sm text-slate-900">
                        {tx.trx_type === '-' ? '-' : '+'}P{formatMoney(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-500">Bal: P{formatMoney(tx.post_balance)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {!loading && lastPage > 1 && (
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-slate-500">
            Page {page} of {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </AccountLayout>
  )
}

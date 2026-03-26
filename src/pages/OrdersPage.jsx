import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import AccountSidebar from '../components/AccountSidebar'

const STATUS_MAP = {
  0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  2: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  3: { label: 'Returned', color: 'bg-purple-100 text-purple-800' },
  4: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await ordersApi.list({ page })
        const data = res.data?.data || res.data
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          setOrders(data?.data || [])
          setLastPage(data?.last_page || 1)
        }
      } catch {
        setError('Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user, navigate, page])

  const statusInfo = (status) => STATUS_MAP[status] ?? { label: 'Unknown', color: 'bg-slate-100 text-slate-600' }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AccountSidebar />

        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 pt-16 lg:pt-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold">My Orders</h1>
              <p className="text-slate-500 mt-1">Track your order history</p>
            </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-slate-300 text-7xl">receipt_long</span>
            <h3 className="text-xl font-bold text-slate-600">No orders yet</h3>
            <p className="text-slate-400">Your orders will appear here once you make a purchase.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-base">storefront</span>
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const { label, color } = statusInfo(order.status)
              return (
                <Link to={`/orders/${order.id}`} key={order.id} className="bg-white border border-primary/10 rounded-2xl p-5 hover:shadow-xl transition-all flex items-center justify-between gap-4 group">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 truncate">{order.trx_ref || `#ORD-${order.id}`}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}>{label}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.quantity ?? 0} item{(order.quantity ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total</p>
                      <p className="font-extrabold text-lg text-slate-900">₱{Number(order.total_price ?? order.total_price ?? 0).toLocaleString()}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-primary hover:text-primary text-sm font-medium">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Prev
            </button>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)} className={`size-9 rounded-lg text-sm font-bold border transition-all ${n === page ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:border-primary hover:text-primary text-sm font-medium">
              Next
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        )}
      </main>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  )
}

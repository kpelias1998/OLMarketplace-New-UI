import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { productImgUrl } from '../utils/assets'

const STATUS_MAP = {
  0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: 'schedule' },
  1: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: 'inventory_2' },
  2: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: 'local_shipping' },
  3: { label: 'Returned', color: 'bg-purple-100 text-purple-800', icon: 'undo' },
  4: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: 'cancel' },
}

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [rating, setRating] = useState({ show: false, value: 5, comment: '', loading: false, done: false })

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await ordersApi.detail(id)
        setOrder(res.data?.data ?? res.data)
      } catch {
        setError('Order not found or failed to load.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, user, navigate])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelLoading(true)
    try {
      await ordersApi.cancel(id)
      setOrder(prev => ({ ...prev, status: 4 }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleRate = async (e) => {
    e.preventDefault()
    setRating(r => ({ ...r, loading: true }))
    try {
      await ordersApi.rate(id, { rating: rating.value, comment: rating.comment })
      setRating(r => ({ ...r, loading: false, done: true, show: false }))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating.')
      setRating(r => ({ ...r, loading: false }))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div>
      <Footer />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-slate-300 text-7xl">error</span>
          <h2 className="text-xl font-bold text-slate-600">{error}</h2>
          <Link to="/orders" className="text-primary font-semibold hover:underline">Back to Orders</Link>
        </div>
      </main>
      <Footer />
    </div>
  )

  const { label, color, icon } = STATUS_MAP[order.status] ?? { label: 'Unknown', color: 'bg-slate-100 text-slate-600', icon: 'help' }
  const items = order.product ? [{ product: order.product, quantity: order.quantity, price: order.price }] : []
  const subtotal = Number(order.price ?? 0) * Number(order.quantity ?? 1)

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6 flex items-center gap-1">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/orders" className="hover:text-primary">Orders</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-slate-900 font-medium">{order.trx || `#ORD-${order.id}`}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Order Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-primary/10 p-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold">{order.trx || `#ORD-${order.id}`}</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${color}`}>
                <span className="material-symbols-outlined text-base">{icon}</span>
                {label}
              </span>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-primary/10 p-6">
              <h2 className="text-lg font-bold mb-4">Order Items</h2>
              <div className="flex flex-col divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="size-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {(item.product?.thumbnail || item.image) ? (
                        <img
                          src={productImgUrl(item.product?.thumbnail ?? item.image)}
                          alt={item.product?.name ?? item.name}
                          className="size-full object-cover"
                          onError={e => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'64\' height=\'64\' viewBox=\'0 0 64 64\'%3E%3Crect width=\'64\' height=\'64\' fill=\'%23f1f5f9\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%2394a3b8\' font-size=\'24\' dominant-baseline=\'middle\' text-anchor=\'middle\'%3E🛍%3C/text%3E%3C/svg%3E' }}
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center text-slate-300">
                          <span className="material-symbols-outlined text-3xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.product?.name ?? item.name ?? `Item #${idx + 1}`}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity ?? 1}</p>
                    </div>
                    <p className="font-bold text-slate-900 shrink-0">
                      ₱{(Number(item.price ?? item.unit_price ?? 0) * Number(item.quantity ?? 1)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-primary/10 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Delivery Address
              </h2>
              <p className="font-semibold">{order.delivery_info?.fullname}</p>
              <p className="text-slate-600 text-sm mt-1">{order.delivery_info?.phone}</p>
              <p className="text-slate-600 text-sm">{order.delivery_info?.address ?? [order.delivery_info?.city, order.delivery_info?.province].filter(Boolean).join(', ')}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {order.status === 0 && (
                <button
                  onClick={handleCancel}
                  disabled={cancelLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-all disabled:opacity-60"
                >
                  {cancelLoading ? <Spinner size="sm" /> : <span className="material-symbols-outlined text-base">cancel</span>}
                  Cancel Order
                </button>
              )}
              {order.status === 1 && !rating.done && (
                <button
                  onClick={() => setRating(r => ({ ...r, show: !r.show }))}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-all"
                >
                  <span className="material-symbols-outlined text-base">star</span>
                  Rate Order
                </button>
              )}
              {rating.done && (
                <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                  <span className="material-symbols-outlined">check_circle</span>
                  Thank you for your rating!
                </div>
              )}
            </div>

            {/* Rating form */}
            {rating.show && (
              <form onSubmit={handleRate} className="bg-white rounded-2xl border border-primary/10 p-6 flex flex-col gap-4">
                <h2 className="text-lg font-bold">Rate this Order</h2>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(r => ({ ...r, value: star }))}
                      className={`material-symbols-outlined text-3xl transition-colors ${star <= rating.value ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      star
                    </button>
                  ))}
                  <span className="ml-2 text-slate-500 text-sm">{rating.value} / 5</span>
                </div>
                <textarea
                  value={rating.comment}
                  onChange={e => setRating(r => ({ ...r, comment: e.target.value }))}
                  placeholder="Share your experience (optional)..."
                  rows={3}
                  className="rounded-xl border-slate-200 resize-none focus:ring-primary focus:border-primary text-sm"
                />
                <div className="flex gap-3">
                  <button type="submit" disabled={rating.loading} className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60">
                    {rating.loading ? <Spinner size="sm" /> : null}
                    Submit Rating
                  </button>
                  <button type="button" onClick={() => setRating(r => ({ ...r, show: false }))} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:border-slate-300 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-primary/10 p-5 sticky top-24">
              <h2 className="text-base font-bold mb-4">Order Summary</h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                </div>
                {order.shipcost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span className="font-medium">₱{Number(order.shipcost ?? 0).toLocaleString()}</span>
                  </div>
                )}
                {(order.discount || order.voucher_discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₱{Number(order.discount ?? order.voucher_discount ?? 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between">
                  <span className="font-bold text-slate-900">Total Paid</span>
                  <span className="font-extrabold text-primary">
                    ₱{Number(order.total_price ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">payments</span>
                  <span>Paid via <span className="font-semibold text-slate-700">OLPay Wallet</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

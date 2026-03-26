import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkoutApi, cartApi } from '../api'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { productImgUrl } from '../utils/assets'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e2e8f0"/%3E%3C/svg%3E'
function imgUrl(path) {
  return path ? productImgUrl(path) : PLACEHOLDER
}

const STEPS = ['Shipping', 'Review & Pay']

export default function CheckoutPage() {
  const { user } = useAuth()
  const { cart, fetchCart, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)

  // Shipping form
  const [form, setForm] = useState({
    fullname: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : '',
    phone: user?.mobile || '',
    email: user?.email || '',
    address: '',
    region: '',
    province: '',
    city: '',
  })
  const [shipCost, setShipCost] = useState(null)
  const [fetchingShip, setFetchingShip] = useState(false)

  // Voucher
  const [promoCode, setPromoCode] = useState('')
  const [voucherData, setVoucherData] = useState(null)
  const [voucherErr, setVoucherErr] = useState(null)
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  // OLPIN
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    checkoutApi.summary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGetShipping = async () => {
    if (!form.region) return
    setFetchingShip(true)
    try {
      const { data } = await checkoutApi.shipmentCost({ region: form.region, province: form.province, city: form.city })
      setShipCost(data.data?.base_cost ?? 0)
    } catch (_) {
      setShipCost(0)
    } finally {
      setFetchingShip(false)
    }
  }

  const handleApplyVoucher = async () => {
    if (!promoCode.trim()) return
    setApplyingVoucher(true)
    setVoucherErr(null)
    try {
      const { data } = await cartApi.applyVoucher({ promo_code: promoCode.trim() })
      setVoucherData(data.data)
    } catch (err) {
      setVoucherErr(err.response?.data?.message || 'Invalid voucher')
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!pin) { setError('Please enter your OLPIN.'); return }
    setError(null)
    setPlacing(true)
    try {
      const payload = {
        fullname: form.fullname,
        phone: form.phone,
        email: form.email,
        address: form.address,
        region: form.region,
        province: form.province,
        city: form.city,
        payment_method: 'olpay',
        pin,
      }
      if (voucherData?.voucher_id) payload.voucher_id = voucherData.voucher_id
      const { data } = await checkoutApi.placeOrder(payload)
      await clearCart()
      navigate('/order-confirmation', { state: { order: data.data } })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!user || loading) return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <div className="flex flex-1 items-center justify-center"><Spinner size="lg" /></div>
    </div>
  )

  const items = summary?.cart || []
  const subtotal = summary?.subtotal || 0
  const discount = voucherData?.discount || 0
  const shipping = shipCost ?? 0
  const total = subtotal - discount + shipping

  const progressPct = step === 0 ? 50 : 100

  const shippingValid = form.fullname && form.phone && form.address && form.email && form.region && form.province && form.city

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white px-6 md:px-20 py-4">
        <div className="flex items-center gap-3 text-primary">
          <span className="material-symbols-outlined text-3xl">shopping_cart_checkout</span>
          <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
        </div>
        <Link to="/cart" className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined">close</span>
        </Link>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Progress */}
            <div className="bg-white p-6 rounded-xl border border-primary/10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Step {step + 1} of {STEPS.length}
                  </h2>
                  <p className="text-2xl font-bold">{STEPS[step]}</p>
                </div>
                <span className="text-sm font-medium text-slate-500">{progressPct}% Complete</span>
              </div>
              <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              {/* Step indicators */}
              <div className="flex gap-4 mt-4">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`text-sm font-medium ${i === step ? 'text-primary' : i < step ? 'text-primary/60 cursor-pointer hover:text-primary' : 'text-slate-400'}`}
                    onClick={() => i < step && setStep(i)}
                  >
                    {i < step && <span className="material-symbols-outlined text-xs mr-1 align-middle">check</span>}
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="bg-white p-6 rounded-xl border border-primary/10">
                <h3 className="text-lg font-bold mb-6">
                  <span className="material-symbols-outlined text-primary align-middle mr-2">local_shipping</span>
                  Shipping Information
                </h3>
                <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); if (shippingValid) setStep(1) }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Full Name *</span>
                      <input name="fullname" value={form.fullname} onChange={handleFormChange} required placeholder="Juan Dela Cruz" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Phone Number *</span>
                      <input name="phone" value={form.phone} onChange={handleFormChange} required placeholder="09171234567" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">Email Address *</span>
                    <input name="email" type="email" value={form.email} onChange={handleFormChange} required placeholder="juan@example.com" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">Street Name, Building, House No. Barangay *</span>
                    <textarea name="address" value={form.address} onChange={handleFormChange} required placeholder="" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Region *</span>
                      <input name="region" value={form.region} onChange={handleFormChange} required placeholder="NCR" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Province *</span>
                      <input name="province" value={form.province} onChange={handleFormChange} required placeholder="Metro Manila" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">City *</span>
                      <input name="city" value={form.city} onChange={handleFormChange} required placeholder="Manila" className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary" />
                    </label>
                  </div>
                  {/* Check shipping cost */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleGetShipping}
                      disabled={!form.region || fetchingShip}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {fetchingShip ? <Spinner size="sm" /> : <span className="material-symbols-outlined text-sm">local_shipping</span>}
                      Check Shipping Cost
                    </button>
                    {shipCost !== null && (
                      <span className="text-sm font-bold text-primary">
                        ₱{Number(shipCost).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={!shippingValid}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      Continue to Review &amp; Pay
                    </button>
                    <Link to="/cart" className="w-full bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all text-center">
                      Back to Cart
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {/* Step 1: Review & Pay */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                {/* Shipping address review */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">local_shipping</span>
                      Shipping Address
                    </h3>
                    <button onClick={() => setStep(0)} className="text-primary text-sm font-semibold hover:underline">Change</button>
                  </div>
                  <div className="p-4 rounded-lg bg-background-light">
                    <p className="font-bold">{form.fullname}</p>
                    <p className="text-slate-600 text-sm leading-relaxed mt-1">
                      {form.city}, {form.province}, {form.region}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">{form.phone} · {form.email}</p>
                  </div>
                </section>

                {/* Payment method */}
                <section className="bg-white rounded-xl p-6 shadow-sm border border-primary/5">
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                    Payment Method
                  </h3>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
                    <div>
                      <p className="font-bold">OLPay Wallet</p>
                      <p className="text-sm text-slate-500">
                        Balance: ₱{Number(summary?.user?.sw_balance || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-primary ml-auto">check_circle</span>
                  </div>
                  <div className="mt-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Enter OLPIN *</span>
                      <input
                        type="password"
                        maxLength={8}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter your wallet PIN"
                        className="rounded-lg border-slate-200 bg-white h-12 px-4 focus:ring-primary focus:border-primary max-w-xs tracking-widest"
                      />
                    </label>
                  </div>
                </section>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-none w-40 py-4 px-6 rounded-lg border-2 border-primary/20 font-bold hover:bg-primary/5 transition-colors text-primary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || !pin}
                    className="flex-1 py-4 px-6 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {placing ? <Spinner size="sm" /> : <span className="material-symbols-outlined">lock</span>}
                    {placing ? 'Placing Order…' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-primary/10">
                <h3 className="text-lg font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div
                        className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${imgUrl(item.product?.thumbnail)}")` }}
                      />
                      <div className="flex-grow">
                        <p className="text-sm font-bold truncate">{item.product?.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold">
                        ₱{(Number(item.product?.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <hr className="border-primary/5 mb-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">₱{Number(subtotal).toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({voucherData?.voucher_name})</span>
                      <span className="font-medium">-₱{Number(discount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-primary' : ''}`}>
                      {shipping === 0 && shipCost === null ? 'TBD' : `₱${Number(shipping).toLocaleString()}`}
                    </span>
                  </div>
                  <hr className="border-primary/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">₱{Number(total).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-white p-6 rounded-xl border border-primary/10">
                <label className="text-sm font-semibold block mb-3">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow rounded-lg border-primary/20 bg-background-light h-11 px-3 text-sm focus:border-primary focus:ring-primary"
                    placeholder="Enter code"
                    type="text"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={applyingVoucher || !promoCode.trim()}
                    className="px-4 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                  >
                    {applyingVoucher ? '…' : 'Apply'}
                  </button>
                </div>
                {voucherData && (
                  <p className="mt-2 text-xs text-green-600 font-semibold">
                    ✓ {voucherData.voucher_name} — ₱{Number(voucherData.discount).toLocaleString()} off
                  </p>
                )}
                {voucherErr && <p className="mt-2 text-xs text-red-500">{voucherErr}</p>}
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="text-xs font-medium">Secure SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-primary/5 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} OLMarketplace. All rights reserved.
      </footer>
    </div>
  )
}

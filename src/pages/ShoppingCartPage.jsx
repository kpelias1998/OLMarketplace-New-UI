import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Spinner from '../components/Spinner'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productImgUrl } from '../utils/assets'
import { useSettings } from '../context/SettingsContext'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23e2e8f0"/%3E%3C/svg%3E'

function imgUrl(path) {
  return path ? productImgUrl(path) : PLACEHOLDER
}

export default function ShoppingCartPage() {
  const { user } = useAuth()
  const { curSym } = useSettings()
  const { cart, fetchCart, updateItem, removeItem, loading } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchCart()
  }, [user, fetchCart])

  if (!user) return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
        <span className="material-symbols-outlined text-6xl">shopping_cart</span>
        <p className="text-lg font-semibold">Please log in to view your cart</p>
        <Link to="/login" className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">Login</Link>
      </div>
    </div>
  )

  const items = cart.items || []

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="flex-1 px-4 md:px-10 lg:px-20 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <span className="material-symbols-outlined text-7xl">shopping_cart</span>
              <p className="text-xl font-semibold">Your cart is empty</p>
              <Link to="/catalog" className="rounded-lg bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90 transition-all">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Items */}
              <div className="flex-1 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6 bg-white p-4 rounded-xl shadow-sm border border-primary/5 items-center">
                    <Link to={`/products/${item.product_id}`}>
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-24 shrink-0 bg-slate-100"
                        style={{ backgroundImage: `url("${imgUrl(item.product?.thumbnail)}")` }}
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between items-start">
                        <Link to={`/products/${item.product_id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {item.product?.name}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div className="flex items-center gap-3 bg-background-light p-1 rounded-lg border border-primary/10">
                          <button
                            onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                            disabled={loading}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="w-8 text-center font-bold text-slate-700">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                        <p className="text-primary text-xl font-bold">
                          {(Number(item.product?.price) * item.quantity).toLocaleString()} {curSym}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <aside className="w-full lg:w-96">
                <div className="bg-white rounded-xl shadow-md border border-primary/5 p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-6 pb-4 border-b border-primary/10">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal ({cart.count} items)</span>
                      <span className="font-medium text-slate-900">{Number(cart.subtotal).toLocaleString()} {curSym}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className="text-primary font-medium">Calculated at checkout</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-primary/10 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Subtotal</span>
                      <span className="text-2xl font-bold text-primary">{Number(cart.subtotal).toLocaleString()} {curSym}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                  >
                    <span>Proceed to Checkout</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <span className="material-symbols-outlined text-primary">verified_user</span>
                      <span>Secure encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                      <span>Pay with OLPay wallet</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

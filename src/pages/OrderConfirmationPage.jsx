import { useLocation, Link } from 'react-router-dom'
import {  productImgUrl } from '../utils/assets'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23e2e8f0"/%3E%3C/svg%3E'
function imgUrl(path) {
  return path ? productImgUrl(path) : PLACEHOLDER
}

export default function OrderConfirmationPage() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 md:px-40">
        <div className="flex items-center gap-4 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary/10 rounded-full">
            <span className="material-symbols-outlined text-primary text-xl">shopping_basket</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">OLMarketplace</h2>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-40 py-8 flex justify-center">
        <div className="max-w-[640px] w-full flex flex-col items-center">
          {/* Success Icon */}
          <div className="mb-8 text-center">
            <div className="mx-auto size-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-6xl">check_circle</span>
            </div>
            <h1 className="text-4xl font-extrabold mb-2">Success!</h1>
            <p className="text-xl font-semibold">Thank you for your order!</p>
            {order?.trx && (
              <p className="text-primary font-medium mt-1">Order #{order.trx}</p>
            )}
          </div>

          {/* Order Summary */}
          {order && (
            <div className="w-full bg-white rounded-xl shadow-sm border border-primary/10 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Your Order</h3>
                  <p className="text-lg font-semibold">Ref: {order.trx}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold border-b border-primary/5 pb-2">Items Ordered</h3>
                {(order.orders || []).map((o) => (
                  <div key={o.id} className="flex items-center gap-4">
                    <div
                      className="h-16 w-16 rounded-lg bg-primary/5 overflow-hidden flex-shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url("${imgUrl(o.product?.thumbnail)}")` }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{o.product?.name || `Product #${o.product_id}`}</p>
                      <p className="text-sm text-slate-500">Qty: {o.quantity}</p>
                    </div>
                    <p className="font-bold">₱{Number(o.total_price).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-primary/5 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid</span>
                  <span className="text-primary">₱{Number(order.total_paid).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {(order.orders || []).map((o) => (
            <div className="w-full bg-white rounded-xl shadow-sm border border-primary/10 p-6 mb-8">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Shipping To</h3>
                  <p className="mt-1">
                    <span className="font-bold">{o.delivery_info.fullname}</span><br />
                    {o.delivery_info.address}<br />
                    {o.delivery_info.city}, {o.delivery_info.province},{' '}
                    {o.delivery_info.region}
                  </p>
                </div>
              </div>
            </div>
          ))}
           
          {/* {order?.orders?.[0]?.delivery_info && (
            
          )} */}

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              View Orders
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-primary/10 text-primary font-bold py-4 px-6 rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
            >
              <span className="material-symbols-outlined">storefront</span>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-xs">
        © {new Date().getFullYear()} OLMarketplace. All rights reserved.
      </footer>
    </div>
  )
}

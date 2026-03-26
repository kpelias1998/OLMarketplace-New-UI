import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

import { productImgUrl } from '../utils/assets'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23e2e8f0"/%3E%3Ctext x="150" y="160" text-anchor="middle" fill="%2394a3b8" font-family="Inter,sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)

  const imgSrc = product.thumbnail
    ? productImgUrl(product.thumbnail)
    : PLACEHOLDER

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, 1)
      setToast('Added to cart')
      setTimeout(() => setToast(null), 2000)
    } catch (err) {
      setToast(err.response?.data?.message || 'Error adding to cart')
      setTimeout(() => setToast(null), 2500)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link to={`/products/${product.id}`} className="group relative flex flex-col rounded-xl border border-primary/5 bg-white p-3 transition-all hover:shadow-xl hover:-translate-y-1">
      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
          {toast}
        </div>
      )}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-primary/5">
        <img
          src={imgSrc}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
      </div>
      <div className="mt-4 flex flex-1 flex-col px-1">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            {product.category && (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/60 truncate">
                {product.category.name}
              </p>
            )}
            <h3 className="mt-1 text-base font-bold text-slate-800 truncate">{product.name}</h3>
          </div>
          <p className="text-lg font-bold text-primary ml-2 shrink-0">₱{Number(product.price).toLocaleString()}</p>
        </div>
        <div className="mt-auto pt-4">
          <button
            onClick={handleAdd}
            disabled={adding || product.quantity === 0}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
            {adding ? 'Adding…' : product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}

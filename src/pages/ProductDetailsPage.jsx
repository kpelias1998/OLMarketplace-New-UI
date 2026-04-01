import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { productsApi } from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productImgUrl } from '../utils/assets'
import { useSettings } from '../context/SettingsContext'

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23e2e8f0"/%3E%3Ctext x="200" y="210" text-anchor="middle" fill="%2394a3b8" font-family="Inter,sans-serif" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E'

function imgUrl(path) {
  return path ? productImgUrl(path) : PLACEHOLDER
}

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { curSym } = useSettings()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [relateds, setRelateds] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)
  const [mainImg, setMainImg] = useState(null)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    setLoading(true)
    productsApi
      .detail(id)
      .then(({ data }) => {
        setProduct(data.data.product)
        setRelateds(data.data.relateds || [])
        setMainImg(imgUrl(data.data.product.thumbnail))
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await addToCart(product.id, qty)
      setToast('Added to cart!')
      setTimeout(() => setToast(null), 2000)
    } catch (err) {
      setToast(err.response?.data?.message || 'Error')
      setTimeout(() => setToast(null), 2500)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <div className="flex flex-1 items-center justify-center"><Spinner size="lg" /></div>
    </div>
  )

  if (!product) return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
        <span className="material-symbols-outlined text-6xl">search_off</span>
        <p className="text-xl font-semibold">Product not found</p>
        <Link to="/catalog" className="text-primary hover:underline">Back to Catalog</Link>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-primary/60 mb-6">
          <Link className="hover:text-primary" to="/">Home</Link>
          <span className="mx-2">/</span>
          <Link className="hover:text-primary" to="/catalog">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-white">
              <img
                src={mainImg}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {product.category && (
                <Link
                  to={`/catalog?category_id=${product.category_id}`}
                  className="flex items-center gap-1 text-primary font-semibold text-sm tracking-wide uppercase hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">category</span>
                  {product.category?.name || 'Product'}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{product.name}</h1>
            </div>

            <div className="text-3xl font-bold text-primary">{Number(product.price).toLocaleString()} {curSym}</div>

            <div className="flex flex-col gap-4 py-6 border-y border-primary/10">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {/* Qty */}
                <div className="flex items-center border border-primary/20 rounded-lg h-12">
                  <button
                    className="px-4 hover:text-primary transition-colors"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                  >
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="px-4 font-bold min-w-[3rem] text-center">{qty}</span>
                  <button
                    className="px-4 hover:text-primary transition-colors"
                    onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.quantity === 0}
                  className="flex-1 bg-primary text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">shopping_cart</span>
                  {adding ? 'Adding…' : product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
              {toast && (
                <p className={`text-sm font-semibold ${toast.includes('Error') || toast.includes('Only') ? 'text-red-500' : 'text-green-600'}`}>
                  {toast}
                </p>
              )}
            </div>

            {/* Mini Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div className="text-xs">
                  <p className="font-bold">Fast Delivery</p>
                  <p className="text-slate-500">Nationwide shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <div className="text-xs">
                  <p className="font-bold">OLPay</p>
                  <p className="text-slate-500">Pay with wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-8 mb-20">
          <div className="flex border-b border-primary/10 gap-8 overflow-x-auto whitespace-nowrap">
            {['description', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 border-b-2 capitalize font-semibold transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'description' && (
            product.description
              ? <div
                  className="prose max-w-none text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              : <p className="text-slate-500">No description available for this product.</p>
          )}
          {activeTab === 'details' && (
            <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 max-w-md">
              <h4 className="font-bold mb-4">Product Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-slate-500">Product ID</span>
                  <span className="font-medium">#{product.id}</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-medium">{product.category?.name || '-'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Stock</span>
                  <span className="font-medium">{product.quantity} units</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relateds.length > 0 && (
          <div className="flex flex-col gap-8 mb-20">
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-black">Related Products</h3>
              <Link className="text-primary font-bold hover:underline flex items-center gap-1" to="/catalog">
                Shop All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relateds.slice(0, 4).map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

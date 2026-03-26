import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productsApi, cartApi } from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const HERO_BG = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&auto=format&fit=crop&q=60'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const { fetchCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchCart()
    productsApi.categories().then(({ data }) => setCategories(data.data || []))
    productsApi
      .list({ page: 1 })
      .then(({ data }) => setProducts(data.data?.data || []))
      .finally(() => setLoadingProducts(false))
  }, [user, fetchCart])

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-6 md:px-10 lg:px-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl bg-slate-900">
            <div className="flex flex-col md:flex-row items-center min-h-[400px] lg:min-h-[480px] relative">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center opacity-50"
                  style={{ backgroundImage: `url("${HERO_BG}")` }}
                />
              </div>
              <div className="relative z-10 flex flex-col items-start gap-6 p-8 md:p-16 lg:w-3/5">
                <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  New Arrivals
                </span>
                <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
                  Quality Products,<br />Great Prices.
                </h1>
                <p className="text-lg text-slate-200">
                  Discover thousands of products from trusted sellers. Shop with confidence.
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/catalog"
                    className="rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/search"
                    className="rounded-lg bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
                  >
                    Browse All
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              <div className="h-2 w-8 rounded-full bg-primary" />
              <div className="h-2 w-2 rounded-full bg-white/50" />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="px-4 py-12 md:px-10 lg:px-20 bg-primary/5">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Categories</h2>
                <p className="text-slate-500 mt-2">Explore our most popular collections</p>
              </div>
              <Link to="/catalog" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            {categories.length === 0 ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category_id=${cat.id}`}
                    className="group flex flex-col items-center gap-4 rounded-xl bg-white p-6 border border-primary/10 hover:border-primary transition-all cursor-pointer"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary transition-colors">
                      <span className="material-symbols-outlined text-4xl text-primary group-hover:text-white">category</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold">{cat.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trending Products */}
        <section className="px-4 py-16 md:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Trending Products</h2>
            </div>
            {loadingProducts ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
            <div className="mt-10 text-center">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90 transition-all"
              >
                View All Products <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Promo Banners */}
        <section className="px-4 py-12 md:px-10 lg:px-20">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-xl bg-primary p-10 flex flex-col justify-center text-white min-h-[240px]">
              <div className="flex flex-col gap-4 max-w-xs">
                <h3 className="text-2xl font-bold">Free Shipping</h3>
                <p className="text-white/80">On qualifying orders. Fast and reliable delivery.</p>
                <Link to="/catalog" className="w-fit rounded-lg bg-white px-6 py-2 text-sm font-bold text-primary transition-all hover:bg-slate-100">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-100 p-10 flex flex-col justify-center min-h-[240px]">
              <div className="flex flex-col gap-4 max-w-xs">
                <h3 className="text-2xl font-bold">Pay with OLPay</h3>
                <p className="text-slate-600">Use your OLPay wallet for fast, secure checkout with just your OLPIN.</p>
                {!user && (
                  <Link to="/register" className="w-fit rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-all">
                    Sign Up Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

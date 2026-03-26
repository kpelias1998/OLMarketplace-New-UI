import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsApi } from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function ProductCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const currentCategory = searchParams.get('category_id') || ''
  const currentPage = Number(searchParams.get('page') || 1)
  const sort = searchParams.get('sort') || ''

  const load = useCallback(() => {
    setLoading(true)
    productsApi
      .list({
        category_id: currentCategory || undefined,
        page: currentPage,
      })
      .then(({ data }) => {
        let items = data.data?.data || []
        if (sort === 'price_asc') items = [...items].sort((a, b) => a.price - b.price)
        if (sort === 'price_desc') items = [...items].sort((a, b) => b.price - a.price)
        setProducts(items)
        setPagination(data.data)
      })
      .finally(() => setLoading(false))
  }, [currentCategory, currentPage, sort])

  useEffect(() => {
    productsApi.categories().then(({ data }) => setCategories(data.data || []))
  }, [])

  useEffect(() => { load() }, [load])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl grow gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span> Filters
            </h3>
            <div className="space-y-4 border-b border-primary/10 pb-6">
              <h4 className="text-sm font-medium uppercase tracking-wider text-primary/70">Categories</h4>
              <ul className="space-y-2">
                <li>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="cat"
                      checked={!currentCategory}
                      onChange={() => setParam('category_id', '')}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm group-hover:text-primary transition-colors">All Categories</span>
                  </label>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="cat"
                        checked={currentCategory === String(cat.id)}
                        onChange={() => setParam('category_id', cat.id)}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 py-6">
              <h4 className="text-sm font-medium uppercase tracking-wider text-primary/70">Sort By</h4>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="w-full rounded-lg border-primary/20 bg-white py-2 px-3 text-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="flex text-sm text-primary/60 mb-1">
                <Link className="hover:text-primary" to="/">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-primary font-medium">
                  {currentCategory
                    ? categories.find((c) => String(c.id) === currentCategory)?.name || 'Category'
                    : 'All Products'}
                </span>
              </nav>
              <h2 className="text-2xl font-bold">
                {currentCategory
                  ? categories.find((c) => String(c.id) === currentCategory)?.name || 'Products'
                  : 'All Products'}
                {pagination && (
                  <span className="text-sm font-normal text-slate-400 ml-2">({pagination.total} items)</span>
                )}
              </h2>
            </div>
            {/* Mobile sort */}
            <div className="lg:hidden">
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="rounded-lg border-primary/20 bg-white py-2 px-3 text-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Mobile categories */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-6">
            <button
              onClick={() => setParam('category_id', '')}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${!currentCategory ? 'bg-primary text-white' : 'bg-white border border-primary/20 text-slate-700 hover:border-primary'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setParam('category_id', cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${currentCategory === String(cat.id) ? 'bg-primary text-white' : 'bg-white border border-primary/20 text-slate-700 hover:border-primary'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
              <p className="text-lg font-semibold">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams)
                        next.set('page', p)
                        setSearchParams(next)
                      }}
                      className={`h-10 w-10 rounded-lg text-sm font-bold transition-colors ${currentPage === p ? 'bg-primary text-white' : 'bg-white border border-primary/20 hover:border-primary text-slate-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

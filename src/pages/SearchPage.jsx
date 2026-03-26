import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productsApi } from '../api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [input, setInput] = useState(query)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState(null)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recent_searches') || '[]') } catch { return [] }
  })

  useEffect(() => {
    productsApi.categories().then(({ data }) => setCategories(data.data || []))
  }, [])

  useEffect(() => {
    setInput(query)
    if (!query) { setProducts([]); return }
    setLoading(true)
    productsApi
      .list({ search: query, page: 1 })
      .then(({ data }) => {
        setProducts(data.data?.data || [])
        setPagination(data.data)
      })
      .finally(() => setLoading(false))
  }, [query])

  const doSearch = (term) => {
    const t = term.trim()
    if (!t) return
    const next = [t, ...recentSearches.filter((r) => r !== t)].slice(0, 5)
    setRecentSearches(next)
    localStorage.setItem('recent_searches', JSON.stringify(next))
    setSearchParams({ q: t })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doSearch(input)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Mobile search bar */}
        <form onSubmit={handleSubmit} className="md:hidden mb-8">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none text-slate-900"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search products..."
              type="text"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-10">
            {recentSearches.length > 0 && (
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Recent Searches</h3>
                <div className="flex flex-col gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => doSearch(s)}
                      className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors text-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">history</span>
                        <span className="text-sm font-medium">{s}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Categories</h3>
              <div className="grid grid-cols-1 gap-3">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/catalog?category_id=${cat.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
                  >
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">category</span>
                    </div>
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          {/* Results */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                {query ? (
                  <>
                    <h1 className="text-2xl font-bold">Results for &ldquo;{query}&rdquo;</h1>
                    <p className="text-slate-500 text-sm mt-1">
                      {pagination ? `${pagination.total} products found` : ''}
                    </p>
                  </>
                ) : (
                  <h1 className="text-2xl font-bold">Search Products</h1>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : products.length === 0 && query ? (
              <div className="mt-10 bg-primary/5 rounded-2xl p-8 text-center flex flex-col items-center border-2 border-dashed border-primary/20">
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl">search_off</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No results for &ldquo;{query}&rdquo;</h3>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  Try a different search term or browse our categories.
                </p>
                <Link to="/catalog" className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  Browse All Products
                </Link>
              </div>
            ) : !query ? (
              <div className="text-center py-20 text-slate-400">
                <span className="material-symbols-outlined text-6xl mb-4 block">search</span>
                <p className="text-lg">Type something to search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

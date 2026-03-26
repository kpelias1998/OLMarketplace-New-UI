import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 backdrop-blur-md px-4 md:px-10 lg:px-20 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary shrink-0">
          <img src="/logo.png" alt="OLMarketplace" className="h-8 w-auto" />
          <h2 className="text-xl font-bold tracking-tight">OLMarketplace</h2>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            {/* <span className="material-symbols-outlined absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">search</span> */}
            <input
              className="w-full rounded-lg border border-primary/20 bg-primary/5 pl-10 pr-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cart.count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cart.count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">person</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary/10 py-2 z-50">
                  <div className="px-4 py-2 border-b border-primary/10">
                    <p className="text-sm font-bold truncate">{user.firstname} {user.lastname}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="material-symbols-outlined text-sm">dashboard</span> Dashboard
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="material-symbols-outlined text-sm">shopping_bag</span> Orders
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white text-sm hover:bg-primary/90 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <form onSubmit={handleSearch} className="md:hidden mt-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">search</span>
          <input
            className="w-full rounded-lg border border-primary/20 bg-primary/5 pl-10 pr-4 py-2 focus:border-primary outline-none text-sm"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>
      </form>
    </header>
  )
}

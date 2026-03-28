import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ACCOUNT_NAV_ITEMS = [
  { label: 'Dashboard',        icon: 'dashboard',     to: '/dashboard' },
  { label: 'OLPay',            icon: 'payment', to: '/transfer' },
  { label: 'Plans',            icon: 'workspace_premium', to: '/plans' },
  { label: 'My Referrals',     icon: 'group',         to: '/my-referrals' },
  // { label: 'Binary Summary',   icon: 'account_tree',  to: '/binary-summary' },
  { label: 'Transactions',     icon: 'receipt',       to: '/transactions' },
  { label: 'My Orders',        icon: 'receipt_long',  to: '/orders' },
  { label: 'Support Tickets',  icon: 'support_agent', to: '/support-tickets' },
  { label: 'Profile Settings', icon: 'person',        to: '/profile-settings' },
  { label: 'Change Password',  icon: 'lock',          to: '/change-password' },
  { label: 'Change PIN',       icon: 'pin',           to: '/change-pin' },
  // { label: 'Browse Products',  icon: 'storefront',    to: '/catalog' },
  // { label: 'Cart',             icon: 'shopping_cart', to: '/cart' },
]

function isActivePath(pathname, to) {
  if (to === '/orders') return pathname === '/orders' || pathname.startsWith('/orders/')
  return pathname === to
}

/**
 * Reusable account sidebar. Manages its own open/close state internally so
 * consuming pages only need to render <AccountSidebar /> with no props.
 *
 * Optional props:
 *   navItems  – override the default ACCOUNT_NAV_ITEMS list
 */
export default function AccountSidebar({ navItems = ACCOUNT_NAV_ITEMS }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  const initials = (user?.firstname?.[0] || user?.username?.[0] || 'U').toUpperCase()

  return (
    <>
      {/* Mobile toggle button — rendered inside the sidebar so consuming pages
          only need one line. Visible only on < lg screens. */}
      <button
        className="lg:hidden fixed top-[4.5rem] left-4 z-50 flex items-center gap-2 text-sm font-semibold text-primary bg-white border border-primary/20 rounded-lg px-3 py-2 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined text-xl">menu</span>
        Menu
      </button>

      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          type="button"
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-primary/10 flex flex-col z-40 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* User identity */}
        <div className="px-5 py-5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold shrink-0 select-none">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-slate-900 truncate">
                {[user?.firstname, user?.lastname].filter(Boolean).join(' ') || user?.username}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ label, icon, to }) => {
            const isActive = isActivePath(pathname, to)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-500 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    isActive ? 'material-symbols-filled' : ''
                  }`}
                >
                  {icon}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-primary/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

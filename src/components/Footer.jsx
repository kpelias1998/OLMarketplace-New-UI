import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-12 bg-slate-900 px-4 py-16 text-slate-400 md:px-10 lg:px-20">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-3xl">eco</span>
            <h2 className="text-xl font-bold tracking-tight">OLMarketplace</h2>
          </div>
          <p className="text-sm leading-relaxed">Your one-stop marketplace for quality products at great prices.</p>
          <div className="flex gap-4">
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
            <a className="hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
          </div>
        </div>
        <div>
          <h4 className="mb-6 font-bold text-white">Shop</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link className="hover:text-white transition-colors" to="/catalog">All Products</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/search">Search</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold text-white">Account</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link className="hover:text-white transition-colors" to="/login">Login</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/register">Register</Link></li>
            <li><Link className="hover:text-white transition-colors" to="/orders">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-6 font-bold text-white">Help</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><a className="hover:text-white transition-colors" href="#">Shipping Policy</a></li>
            <li><a className="hover:text-white transition-colors" href="#">Returns &amp; Refunds</a></li>
            <li><a className="hover:text-white transition-colors" href="#">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-slate-800 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} OLMarketplace. All rights reserved.</p>
        <div className="flex gap-6">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import AccountSidebar from './AccountSidebar'
export { ACCOUNT_NAV_ITEMS } from './AccountSidebar'

export default function AccountLayout({ title, subtitle, children, rightAction }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <AccountSidebar />

        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 pt-16 lg:pt-8">

            {(title || subtitle || rightAction) && (
              <section className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="text-slate-500 mt-1.5 font-medium">{subtitle}</p>}
                </div>
                {rightAction}
              </section>
            )}

            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </div>
  )
}


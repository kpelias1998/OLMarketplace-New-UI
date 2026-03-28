import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import HomePage from './pages/HomePage'
import ProductCatalogPage from './pages/ProductCatalogPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import SearchPage from './pages/SearchPage'
import ShoppingCartPage from './pages/ShoppingCartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import UserDashboardPage from './pages/UserDashboardPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ChangePinPage from './pages/ChangePinPage'
import SupportTicketPage from './pages/SupportTicketPage'
import TransactionsPage from './pages/TransactionsPage'
import PlanPage from './pages/PlanPage'
import MyReferralsPage from './pages/MyReferralsPage'
import BinarySummaryPage from './pages/BinarySummaryPage'
import OLPayPage from './pages/OLPayPage'

function AdminTokenHandler() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const adminToken = params.get('adminToken')
    if (!adminToken) return

    params.delete('adminToken')
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '')
    window.history.replaceState({}, '', newUrl)

    loginWithToken(adminToken).then(() => {
      navigate('/dashboard')
    })
  }, [])

  return null
}

export default function App() {
  
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
        <AdminTokenHandler />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<ProductCatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/transfer" element={<OLPayPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/profile-settings" element={<ProfileSettingsPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/change-pin" element={<ChangePinPage />} />
          <Route path="/support-tickets" element={<SupportTicketPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/plans" element={<PlanPage />} />
          <Route path="/my-referrals" element={<MyReferralsPage />} />
          <Route path="/binary-summary" element={<BinarySummaryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
    </SettingsProvider>
  )
}

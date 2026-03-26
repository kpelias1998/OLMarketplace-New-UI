import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { cartApi } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await cartApi.get()
      setCart(data.data)
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (user) fetchCart()
    else setCart({ items: [], subtotal: 0, count: 0 })
  }, [user, fetchCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true)
    try {
      await cartApi.add({ product_id: productId, quantity })
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const updateItem = useCallback(async (cartId, quantity) => {
    setLoading(true)
    try {
      await cartApi.update({ cart_id: cartId, quantity })
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const removeItem = useCallback(async (cartItemId) => {
    setLoading(true)
    try {
      await cartApi.remove(cartItemId)
      await fetchCart()
    } finally {
      setLoading(false)
    }
  }, [fetchCart])

  const clearCart = useCallback(async () => {
    await cartApi.clear()
    setCart({ items: [], subtotal: 0, count: 0 })
  }, [])

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, updateItem, removeItem, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)

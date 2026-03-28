import { createContext, useContext, useState, useCallback } from 'react'
import { authApi, userApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user')
    try { return raw ? JSON.parse(raw) : null } catch { return null }
  })

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('auth_token', data.data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    return data
  }, [])

  const register = useCallback(async (form) => {
    const { data } = await authApi.register(form)
    localStorage.setItem('auth_token', data.data.token)
    localStorage.setItem('auth_user', JSON.stringify(data.data.user))
    setUser(data.data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch (_) {}
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('auth_user', JSON.stringify(updatedUser))
  }, [])

  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('auth_token', token)
    const infoRes = await userApi.info()
    const userData = infoRes.data?.data || infoRes.data
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

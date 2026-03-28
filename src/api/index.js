import axios from 'axios'
import { BASE_URL } from '../utils/assets'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

/* ── Auth ─────────────────────────────────────────────────────── */
export const authApi = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.get('/logout'),
  forgotSend: (data) => api.post('/password/email', data),
  forgotVerify: (data) => api.post('/password/verify-code', data),
  resetPassword: (data) => api.post('/password/reset', data),
  checkAuth: () => api.get('/authorization'),
}

/* ── User ─────────────────────────────────────────────────────── */
export const userApi = {
  info: () => api.get('/user-info'),
  dashboard: () => api.get('/dashboard'),
  updateProfile: (data) => api.post('/profile-setting', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.post('/change-password', data),
  changePin: (data) => api.post('/change-pin', data),
  transactions: (page = 1) => api.get('/transactions', { params: { page } }),
}

/* ── Products ─────────────────────────────────────────────────── */
export const productsApi = {
  list: (params) => api.get('/products', { params }),
  detail: (id) => api.get(`/products/${id}`),
  categories: () => api.get('/categories'),
}

/* ── Cart ─────────────────────────────────────────────────────── */
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (data) => api.post('/cart/update', data),
  remove: (id) => api.delete(`/cart/remove/${id}`),
  clear: () => api.post('/cart/delete'),
  applyVoucher: (data) => api.post('/cart/apply-voucher', data),
}

/* ── Checkout ─────────────────────────────────────────────────── */
export const checkoutApi = {
  summary: () => api.get('/checkout'),
  shipmentCost: (data) => api.post('/checkout/shipment-cost', data),
  placeOrder: (data) => api.post('/checkout/place-order', data),
}

/* ── Orders ───────────────────────────────────────────────────── */
export const ordersApi = {
  list: (page = 1) => api.get('/orders', { params: { page } }),
  detail: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/cancel/${id}`),
  rate: (id, data) => api.post(`/orders/rating/${id}`, data),
}

/* ── Support Tickets ─────────────────────────────────────────── */
export const supportApi = {
  list: (page = 1) => api.get('/ticket', { params: { page } }),
  create: (data) => api.post('/ticket/create', data),
  view: (ticket) => api.get(`/ticket/view/${ticket}`),
  reply: (id, data) => api.post(`/ticket/reply/${id}`, data),
  close: (id) => api.post(`/ticket/close/${id}`),
}

/* ── Geography ────────────────────────────────────────────────── */
export const geoApi = {
  provinces: (regionId) => api.get(`/getProvince/${regionId}`),
  cities: (provinceId) => api.get(`/getCityMun/${provinceId}`),
  shipmentCost: (data) => api.post('/getShipmentCost', data),
}

/* ── Plans ────────────────────────────────────────────────────── */
export const plansApi = {
  list: () => api.get('/plans'),
  subscribe: (data) => api.post('/plans/subscribe', data),
  bvLog: (params) => api.get('/plans/bv-log', { params }),
  binaryCommission: (page = 1) => api.get('/plans/binary-commission', { params: { page } }),
  binarySummary: () => api.get('/plans/binary-summary'),
  myReferral: (page = 1) => api.get('/plans/my-referral', { params: { page } }),
}

/* ── Deposit ─────────────────────────────────────────────────── */
export const depositApi = {
  methods: () => api.get('/deposit/methods'),
  insert: (data) => api.post('/deposit/insert', data),
  confirm: (data) => api.post('/app/payment/confirm', data),
  history: (page = 1) => api.get('/deposit/history', { params: { page } }),
}

/* ── Withdraw ────────────────────────────────────────────────── */
export const withdrawApi = {
  methods: () => api.get('/withdraw/methods'),
  store: (data) => api.post('/withdraw/store', data),
  history: (page = 1) => api.get('/withdraw/history', { params: { page } }),
}

/* ── Balance Transfer ─────────────────────────────────────────── */
export const transferApi = {
  info: () => api.get('/transfer/info'),
  cashWallet: (data) => api.post('/transfer/balance', data),
  registration: (data) => api.post('/transfer/registration', data),
  merchant: (data) => api.post('/transfer/merchant', data),
  searchUser: (data) => api.post('/transfer/search-user', data),
}

/* ── General Settings (public) ───────────────────────────────── */
export const settingsApi = {
  get: () => api.get('/general-setting'),
}

/* ── General ──────────────────────────────────────────────────── */
export const generalApi = {
  settings: () => api.get('/general-setting'),
  policies: () => api.get('/policies'),
}

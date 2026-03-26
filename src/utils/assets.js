/**
 * The backend base URL, sourced from the VITE_API_BASE_URL environment
 * variable. Import this constant instead of hardcoding the domain anywhere.
 *
 * Usage:
 *   import { BASE_URL, assetUrl, productImgUrl } from '../utils/assets'
 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://olmarketplacev2.test'

/** Builds a URL for any asset stored under /assets/images/ */
export const assetUrl = (path) => `${BASE_URL}/assets/images/${path}`

/** Builds a URL for product images stored under /assets/images/products/ */
export const productImgUrl = (path) => `${BASE_URL}/assets/images/products/${path}`

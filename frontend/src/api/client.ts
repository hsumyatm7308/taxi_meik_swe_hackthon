import axios from 'axios'
import { API_BASE_URL } from '@/constants'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config
//
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//
//     return Promise.reject(error)
//   },
// )

const cacheMap = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL_MS = 30 * 1000 // 30 seconds cache TTL

const getCacheKey = (url: string, params?: any) => {
  return url + '?' + (params ? JSON.stringify(params) : '')
}

export const apiCache = {
  has: (url: string, params?: any): boolean => {
    const key = getCacheKey(url, params)
    const cached = cacheMap.get(key)
    return !!(cached && Date.now() - cached.timestamp < CACHE_TTL_MS)
  },
  get: (url: string, params?: any): any | null => {
    const key = getCacheKey(url, params)
    const cached = cacheMap.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }
    return null
  },
  set: (url: string, params: any, data: any) => {
    const key = getCacheKey(url, params)
    cacheMap.set(key, { data, timestamp: Date.now() })
  },
  clear: () => {
    cacheMap.clear()
  },
}

// Wrap Axios GET requests to return cached values if valid
const originalGet = apiClient.get
apiClient.get = async function (url: string, config?: any) {
  const params = config?.params
  if (apiCache.has(url, params)) {
    return apiCache.get(url, params)
  }
  const response = await originalGet.call(this, url, config)
  apiCache.set(url, params, response)
  return response
}

// Invalidate full cache on mutations
const clearCacheOnMutation = () => {
  apiCache.clear()
}

const originalPost = apiClient.post
apiClient.post = async function (url: string, data?: any, config?: any) {
  clearCacheOnMutation()
  return originalPost.call(this, url, data, config)
}

const originalPut = apiClient.put
apiClient.put = async function (url: string, data?: any, config?: any) {
  clearCacheOnMutation()
  return originalPut.call(this, url, data, config)
}

const originalDelete = apiClient.delete
apiClient.delete = async function (url: string, config?: any) {
  clearCacheOnMutation()
  return originalDelete.call(this, url, config)
}

export default apiClient

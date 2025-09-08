// import axios from 'axios'

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
//   withCredentials: true,
//   timeout: 10000,
// })

// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('accessToken')
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//     }

//     console.log(
//       `API 요청: ${config.method?.toUpperCase()} ${config.url}`,
//     )
//     return config
//   },
//   (error) => Promise.reject(error),
// )

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // 인증 실패 → 로그인 페이지로
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   },
// )

// export default api

import axios from 'axios'

import { useAuthStore } from '@/store/useAuthStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    console.log(
      `API 요청: ${config.method?.toUpperCase()} ${config.url}`,
    )
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const state = useAuthStore.getState()

      // ✅ guides는 공개 API → redirect 안 함
      if (url.includes('/guides')) {
        console.warn('401 Unauthorized (공개 API: redirect 안 함)')
      } else if (state.user?.provider !== 'mock') {
        console.warn('401 Unauthorized → 로그인 페이지 이동')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

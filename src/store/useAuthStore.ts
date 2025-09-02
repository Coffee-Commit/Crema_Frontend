// 'use client'

// import { create } from 'zustand'

// import api from '@/lib/http/api'

// type Provider = 'google' | 'kakao'

// export type User = {
//   id: string
//   nickname: string
//   role: 'ROOKIE' | 'GUIDE'
//   phoneNumber: string | null
//   point: number
//   profileImageUrl: string | null
//   description: string | null
//   provider: Provider
//   createdAt: string
// }

// type ApiResp<T> = {
//   message: string
//   result: T
//   isSuccess: boolean
// }

// type State = {
//   user: User | null
//   isLoggedIn: boolean
//   loading: boolean
//   init: () => Promise<void>
//   login: (provider: Provider) => void
//   logout: () => Promise<void>
// }

// export const useAuthStore = create<State>((set) => ({
//   user: null,
//   isLoggedIn: false,
//   loading: false,

//   // 로그인 상태 확인 + 유저 정보 가져오기
//   init: async () => {
//     set({ loading: true })
//     try {
//       const status = await api.get<ApiResp<boolean>>(
//         '/api/auth/status',
//       )
//       if (status.data.result) {
//         const me = await api.get<ApiResp<User>>('/api/member/me')
//         console.log('유저 정보:', me.data.result)
//         set({ user: me.data.result, isLoggedIn: true })
//       } else {
//         set({ user: null, isLoggedIn: false })
//       }
//     } catch (e) {
//       console.error('init 실패:', e)
//       set({ user: null, isLoggedIn: false })
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // 로그인 시작
//   login: (provider) => {
//     console.log(
//       'NEXT_PUBLIC_API_URL:',
//       process.env.NEXT_PUBLIC_API_URL,
//     )
//     window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/${provider}`
//   },

//   // 로그아웃
//   logout: async () => {
//     try {
//       await api.post('/api/auth/logout')
//       set({ user: null, isLoggedIn: false })
//       window.location.href = '/login'
//     } catch (e) {
//       console.error('로그아웃 실패:', e)
//     }
//   },
// }))

'use client'

import { create } from 'zustand'
// import api from '@/lib/http/api'

type Provider = 'google' | 'kakao'

export type User = {
  id: string
  nickname: string
  role: 'ROOKIE' | 'GUIDE'
  phoneNumber: string | null
  point: number
  profileImageUrl: string | null
  description: string | null
  provider: Provider
  createdAt: string
}

// type ApiResp<T> = {
//   message: string
//   result: T
//   isSuccess: boolean
// }

type State = {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  init: () => Promise<void>
  login: (provider?: Provider) => void
  logout: () => Promise<void>
}

const mockUserBase: Omit<User, 'provider'> = {
  id: 'mock-user-id',
  nickname: '오뎅🍥',
  role: 'GUIDE',
  phoneNumber: '010-1234-5678',
  point: 100,
  profileImageUrl: null,
  description: '안녕하세요, 선배 오뎅 입니다.',
  createdAt: new Date().toISOString(),
}

function getMockUser(provider: Provider = 'google'): User {
  return {
    ...mockUserBase,
    provider,
  }
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,

  init: async () => {
    set({ loading: true })
    try {
      // 실제 API 연동 코드
      /*
      const status = await api.get<ApiResp<boolean>>('/api/auth/status')
      if (status.data.result) {
        const me = await api.get<ApiResp<User>>('/api/member/me')
        console.log('유저 정보:', me.data.result)
        set({ user: me.data.result, isLoggedIn: true })
      } else {
        set({ user: null, isLoggedIn: false })
      }
      */

      // ✅ 목데이터 로그인
      const mockUser = getMockUser()
      set({ user: mockUser, isLoggedIn: true })
      console.log('🧪 init에서 목데이터 로그인됨:', mockUser)
    } catch (e) {
      console.error('init 실패:', e)
      set({ user: null, isLoggedIn: false })
    } finally {
      set({ loading: false })
    }
  },

  login: (provider?: Provider) => {
    const mockUser = getMockUser(provider)
    set({ user: mockUser, isLoggedIn: true })
    console.log('🧪 login에서 목데이터 로그인됨:', mockUser)
  },

  logout: async () => {
    try {
      // await api.post('/api/auth/logout')
      set({ user: null, isLoggedIn: false })
      window.location.href = '/login'
    } catch (e) {
      console.error('로그아웃 실패:', e)
    }
  },
}))

// 'use client'

// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// import api from '@/lib/http/api'

// type Provider = 'google' | 'kakao' | 'mock'

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
//   mockLogin: () => void // 👈 목데이터 로그인 추가
// }

// // 로컬스토리지에서 초기 상태 동기 로드
// function getInitialAuth(): Pick<State, 'user' | 'isLoggedIn'> {
//   if (typeof window === 'undefined')
//     return { user: null, isLoggedIn: false }
//   try {
//     const raw = localStorage.getItem('auth-storage')
//     if (!raw) return { user: null, isLoggedIn: false }
//     const parsed = JSON.parse(raw)
//     const saved = parsed?.state ?? parsed
//     return {
//       user: saved?.user ?? null,
//       isLoggedIn: Boolean(saved?.isLoggedIn),
//     }
//   } catch {
//     return { user: null, isLoggedIn: false }
//   }
// }

// const initial = getInitialAuth()

// export const useAuthStore = create<State>()(
//   persist(
//     (set, get) => ({
//       // ✅ 첫 렌더부터 저장된 로그인 상태로 시작
//       user: initial.user,
//       isLoggedIn: initial.isLoggedIn,
//       loading: false,

//       // 로그인 상태 확인 + 유저 정보 가져오기
//       init: async () => {
//         set({ loading: true })
//         try {
//           const status = await api.get<ApiResp<boolean>>(
//             '/api/auth/status',
//           )
//           if (status.data.result) {
//             const me = await api.get<ApiResp<User>>('/api/member/me')
//             set({ user: me.data.result, isLoggedIn: true })
//           } else {
//             set({ user: null, isLoggedIn: false })
//           }
//         } catch (e) {
//           console.error('init 실패:', e)
//           set({ user: null, isLoggedIn: false })
//         } finally {
//           set({ loading: false })
//         }
//       },

//       // 실제 로그인 시작
//       login: (provider) => {
//         window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth2/authorization/${provider}`
//       },

//       // 로그아웃 - 목데이터 추가 버전
//       logout: async () => {
//         try {
//           const currentUser = get().user
//           // 목데이터 로그인일 경우
//           if (currentUser?.provider === 'mock') {
//             set({ user: null, isLoggedIn: false })
//             window.location.assign('/')
//             return
//           }

//           await api.post('/api/auth/logout')
//           set({ user: null, isLoggedIn: false })
//           window.location.assign('/')
//         } catch (e) {
//           console.error('로그아웃 실패:', e)
//           set({ user: null, isLoggedIn: false })
//           window.location.assign('/')
//         }
//       },
//       // 목데이터 로그인
//       mockLogin: () => {
//         set({
//           user: {
//             id: 'mock-1',
//             nickname: '오뎅🍥',
//             role: 'ROOKIE',
//             phoneNumber: null,
//             point: 999,
//             profileImageUrl: null,
//             description: '안녕하세요, 후배 오뎅 입니다.',
//             provider: 'mock',
//             createdAt: new Date().toISOString(),
//           },
//           isLoggedIn: true,
//         })
//       },
//     }),
//     {
//       name: 'auth-storage', // localStorage 키 이름
//       partialize: (state) => ({
//         user: state.user,
//         isLoggedIn: state.isLoggedIn,
//       }),
//     },
//   ),
// )

'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import api from '@/lib/http/api'

type Provider = 'google' | 'kakao' | 'mock'

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

// ✅ 토큰 타입 추가
export type Tokens = {
  accessToken: string
  refreshToken: string
}

type ApiResp<T> = {
  message: string
  result: T
  isSuccess: boolean
}

type State = {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  tokens: Tokens | null
  init: () => Promise<void>
  login: (provider: Provider) => void
  logout: () => Promise<void>
  mockLoginWithTokens: () => void
}

// 로컬스토리지에서 초기 상태 동기 로드
function getInitialAuth(): Pick<
  State,
  'user' | 'isLoggedIn' | 'tokens'
> {
  if (typeof window === 'undefined')
    return { user: null, isLoggedIn: false, tokens: null }
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return { user: null, isLoggedIn: false, tokens: null }
    const parsed = JSON.parse(raw)
    const saved = parsed?.state ?? parsed
    return {
      user: saved?.user ?? null,
      isLoggedIn: Boolean(saved?.isLoggedIn),
      tokens: saved?.tokens ?? null,
    }
  } catch {
    return { user: null, isLoggedIn: false, tokens: null }
  }
}

const initial = getInitialAuth()

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      user: initial.user,
      isLoggedIn: initial.isLoggedIn,
      tokens: initial.tokens,
      loading: false,

      init: async () => {
        set({ loading: true })
        try {
          const status = await api.get<ApiResp<boolean>>(
            '/api/auth/status',
          )
          if (status.data.result) {
            const me = await api.get<ApiResp<User>>('/api/member/me')
            set({ user: me.data.result, isLoggedIn: true })
          } else {
            set({ user: null, isLoggedIn: false, tokens: null })
          }
        } catch (e) {
          console.error('init 실패:', e)
          set({ user: null, isLoggedIn: false, tokens: null })
        } finally {
          set({ loading: false })
        }
      },

      login: (provider) => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth2/authorization/${provider}`
      },

      logout: async () => {
        try {
          const currentUser = get().user
          if (currentUser?.provider === 'mock') {
            set({ user: null, isLoggedIn: false, tokens: null })
            window.location.assign('/')
            return
          }

          await api.post('/api/auth/logout')
          set({ user: null, isLoggedIn: false, tokens: null })
          window.location.assign('/')
        } catch (e) {
          console.error('로그아웃 실패:', e)
          set({ user: null, isLoggedIn: false, tokens: null })
          window.location.assign('/')
        }
      },

      // ✅ 목데이터 로그인 (토큰까지 세팅)
      mockLoginWithTokens: () => {
        const mockAccess =
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0MjA4NTg2NSIsInR5cGUiOiJhY2Nlc3MiLCJqdGkiOiI2ZWU5MjQ3ZS1mMTRmLTQyOWUtOTdmYy1hNDJkYjYxNDJkMGEiLCJpYXQiOjE3NTczMTg1NzYsImV4cCI6MTc1NzMyMDM3Nn0.g8X_5uy50vYt4F2R9N3UkDnV6Lpo-90ydqt1iqa3ls_Bh8375KMaTBpmgkbR3J64XcGlLSoat9PabaBBsTcefw'
        const mockRefresh =
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0MjA4NTg2NSIsInR5cGUiOiJyZWZyZXNoIiwianRpIjoiMmIwY2JiOGItYTY1Ni00NjcwLTgxZTEtNzExNjIwNTdhMWQ0IiwiaWF0IjoxNzU3MzE4NTc2LCJleHAiOjE3NTg1MjgxNzZ9.-97MswJmVNOhTuzEKr7gTC63SrYZecrO9kDIDcyg4D7Vf7WylLutM2m_Jjb4dU1Y1a_-sy47hjpj0fFVguxD_Q'

        set({
          user: {
            id: 'mock-1',
            nickname: '오뎅🍥',
            role: 'ROOKIE',
            phoneNumber: null,
            point: 999,
            profileImageUrl: null,
            description: '안녕하세요, 후배 오뎅 입니다.',
            provider: 'mock',
            createdAt: new Date().toISOString(),
          },
          isLoggedIn: true,
          tokens: {
            accessToken: mockAccess,
            refreshToken: mockRefresh,
          },
        })

        // ✅ 상태 제대로 바뀌었는지 확인
        console.log('after mockLoginWithTokens', get())

        // 로컬스토리지에도 강제 저장 (persist 이전 확인용)
        localStorage.setItem('accessToken', mockAccess)
        localStorage.setItem('refreshToken', mockRefresh)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        tokens: state.tokens,
      }),
    },
  ),
)

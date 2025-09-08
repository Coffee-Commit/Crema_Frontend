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

type Provider = 'google' | 'kakao' | 'mock' | 'test'

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
  setAuth: (payload: { user: User; tokens: Tokens }) => void
}

// 로컬스토리지 초기 상태 로드
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

      // 서버 상태 초기화
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

      // 실제 OAuth 로그인
      login: (provider) => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/oauth2/authorization/${provider}`
      },

      // 로그아웃
      logout: async () => {
        try {
          const currentUser = get().user
          if (
            currentUser?.provider === 'mock' ||
            currentUser?.provider === 'test'
          ) {
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

      // ✅ mock 로그인 (토큰 없이 상태만 세팅)
      mockLoginWithTokens: () => {
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
          tokens: null,
        })

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        console.log('✅ mockLoginWithTokens 실행 (토큰 없음)')
      },

      // ✅ test 계정 로그인 (create-rookie / create-guide → login API 결과 반영)
      setAuth: ({ user, tokens }) => {
        set({ user, tokens, isLoggedIn: true })
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

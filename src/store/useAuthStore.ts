'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import api from '@/lib/http/api'

type Provider = 'google' | 'kakao' | 'test'

export type User = {
  id: string
  nickname: string
  role: 'ROOKIE' | 'GUIDE'
  email: string | null
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

type ApiResp<T> = { message: string; result: T; isSuccess: boolean }

type TestLoginResult = {
  accessToken: string
  refreshToken: string
  memberId: string
  nickname: string
  role: 'ROOKIE' | 'GUIDE'
  tokenType: 'Bearer'
}

type CreateResult = {
  memberId: string
  nickname: string
  role: 'ROOKIE' | 'GUIDE'
}

type State = {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  tokens: Tokens | null
  init: () => Promise<void>
  login: (provider: Provider) => void
  loginTest: (nickname: string) => Promise<void>
  createRookie: () => Promise<CreateResult>
  createGuide: () => Promise<CreateResult>
  createAndLogin: (role: 'ROOKIE' | 'GUIDE') => Promise<void>
  logout: () => Promise<void>
  setAuth: (payload: { user: User; tokens: Tokens }) => void
  refreshUser: () => Promise<void> // ✅ 추가
}

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
          const hasToken =
            typeof window !== 'undefined' &&
            !!localStorage.getItem('accessToken')
          if (hasToken) {
            const me = await api.get<ApiResp<User>>('/api/member/me')
            set({ user: me.data.result, isLoggedIn: true })
            return
          }
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

      loginTest: async (nickname: string) => {
        const { data } = await api.post<ApiResp<TestLoginResult>>(
          '/api/test/auth/login',
          { nickname },
        )
        const r = data.result
        localStorage.setItem('accessToken', r.accessToken)
        localStorage.setItem('refreshToken', r.refreshToken)
        const me = await api.get<ApiResp<User>>('/api/member/me')
        const fullUser = {
          ...me.data.result,
          provider: 'test' as const,
        }
        set({
          user: fullUser,
          tokens: {
            accessToken: r.accessToken,
            refreshToken: r.refreshToken,
          },
          isLoggedIn: true,
        })
      },

      createRookie: async () => {
        const { data } = await api.post<ApiResp<CreateResult>>(
          '/api/test/auth/create-rookie',
        )
        return data.result
      },

      createGuide: async () => {
        const { data } = await api.post<ApiResp<CreateResult>>(
          '/api/test/auth/create-guide',
        )
        return data.result
      },

      createAndLogin: async (role) => {
        const create =
          role === 'ROOKIE' ? get().createRookie : get().createGuide
        const { nickname } = await create()
        await get().loginTest(nickname)
      },

      logout: async () => {
        try {
          const provider = get().user?.provider
          if (provider === 'test') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            set({ user: null, isLoggedIn: false, tokens: null })
            window.location.assign('/')
            return
          }
          await api.post('/api/auth/logout')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ user: null, isLoggedIn: false, tokens: null })
          window.location.assign('/')
        } catch (e) {
          console.error('로그아웃 실패:', e)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ user: null, isLoggedIn: false, tokens: null })
          window.location.assign('/')
        }
      },

      setAuth: ({ user, tokens }) =>
        set({ user, tokens, isLoggedIn: true }),

      // ✅ 여기 추가
      refreshUser: async () => {
        try {
          const res = await api.get<ApiResp<User>>('/api/member/me')
          const fullUser = {
            ...res.data.result,
            provider: get().user?.provider ?? 'google',
          }
          set({ user: fullUser, isLoggedIn: true })
        } catch (e) {
          console.error('refreshUser 실패:', e)
          set({ user: null, isLoggedIn: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({
        user: s.user,
        isLoggedIn: s.isLoggedIn,
        tokens: s.tokens,
      }),
    },
  ),
)

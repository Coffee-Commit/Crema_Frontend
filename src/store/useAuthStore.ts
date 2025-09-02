'use client'

import { create } from 'zustand'

import api from '@/lib/http/api'

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

type ApiResp<T> = {
  message: string
  result: T
  isSuccess: boolean
}

type State = {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  init: () => Promise<void>
  login: (provider: Provider) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<State>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,

  // 로그인 상태 확인 + 유저 정보 가져오기
  init: async () => {
    set({ loading: true })
    try {
      const status = await api.get<ApiResp<boolean>>(
        '/api/auth/status',
      )
      if (status.data.result) {
        const me = await api.get<ApiResp<User>>('/api/member/me')
        console.log('유저 정보:', me.data.result)
        set({ user: me.data.result, isLoggedIn: true })
      } else {
        set({ user: null, isLoggedIn: false })
      }
    } catch (e) {
      console.error('init 실패:', e)
      set({ user: null, isLoggedIn: false })
    } finally {
      set({ loading: false })
    }
  },

  // 로그인 시작
  login: (provider) => {
    console.log(
      'NEXT_PUBLIC_API_URL:',
      process.env.NEXT_PUBLIC_API_URL,
    )
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/${provider}`
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/api/auth/logout')
      set({ user: null, isLoggedIn: false })
      window.location.href = '/login'
    } catch (e) {
      console.error('로그아웃 실패:', e)
    }
  },
}))

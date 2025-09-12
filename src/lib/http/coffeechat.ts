import api from './api'

export interface MemberCoffeeChat {
  reservationId: number
  guide: {
    nickname: string
    profileImageUrl?: string | null
  }
  createdAt: string
  preferredDateOnly: string
  preferredDayOfWeek: string
  preferredTimeRange: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  timeType: 'MINUTE_30' | 'MINUTE_60'
}

export const getMemberCoffeeChats = async (): Promise<
  MemberCoffeeChat[]
> => {
  const res = await api.get(
    '/api/member/coffee-chat/reservations/all',
  )
  return res.data.result ?? []
}

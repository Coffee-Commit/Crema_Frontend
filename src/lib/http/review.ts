'use client'

import api from './api'

export type ReviewFilter = 'ALL' | 'WRITTEN' | 'NOT_WRITTEN'

export interface GuideInfo {
  nickname: string
  profileImageUrl: string | null
}

export interface ReservationInfo {
  matchingDateTime: string
  timeUnit: 'MINUTE_30' | 'MINUTE_60'
}

export interface ReviewInfo {
  reviewId: number
  comment: string
  star: number
  createdAt: string
}

export interface MyReview {
  reservationId: number
  guide: GuideInfo
  reservation: ReservationInfo
  review: ReviewInfo | null
}

export interface MyReviewResponse {
  message: string
  data: {
    totalElements: number
    totalPages: number
    size: number
    number: number
    content: MyReview[]
  }
}

// ✅ 리뷰 조회 API
export async function fetchMyReviews({
  filter,
  page,
  size,
  sort,
}: {
  filter: ReviewFilter
  page: number
  size?: number
  sort?: string
}): Promise<MyReviewResponse> {
  const res = await api.get<MyReviewResponse>('/api/reviews/me', {
    params: {
      filter,
      page,
      size: size ?? 5,
      sort: sort ?? 'createdAt,desc',
    },
  })
  return res.data
}

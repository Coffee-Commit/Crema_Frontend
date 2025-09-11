import api from './api'

/* ============= GET: 예약 신청 페이지 데이터 ============= */
export const getReservationApply = async (guideId: number) => {
  const res = await api.get(`/api/reservations/apply/${guideId}`)
  console.log('📦 getReservationApply 응답 원본:', res.data.data) // ✅ 확인
  return res.data.data
}

/* ============= GET: 가이드 스케줄 조회 ============= */
export const getGuideSchedules = async (guideId: number) => {
  const res = await api.get(`/api/guides/${guideId}/schedules`)
  console.log('📦 getGuideSchedules 응답 원본:', res.data) // ✅ 확인
  return res.data.schedules
}

/* ============= POST: 예약 신청 ============= */
export const postReservation = async (body: {
  guideId: number
  timeUnit: 'THIRTY_MINUTES' | 'SIXTY_MINUTES'
  survey: {
    messageToGuide: string
    preferredDate: string
    files: { fileUploadUrl: string }[]
  }
}) => {
  const res = await api.post('/api/reservations', body)
  return res.data
}

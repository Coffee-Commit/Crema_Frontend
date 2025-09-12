import api from './api'

/* ============= GET: 예약 신청 페이지 데이터 ============= */
export const getReservationApply = async (guideId: number) => {
  const res = await api.get(`/api/reservations/apply/${guideId}`)
  return res.data.data
}

/* ============= GET: 가이드 스케줄 조회 ============= */
export const getGuideSchedules = async (guideId: number) => {
  const res = await api.get(`/api/guides/${guideId}/schedules`)
  const schedules = res.data.data?.schedules ?? []

  const DAY_MAP: Record<string, string> = {
    MONDAY: '월',
    TUESDAY: '화',
    WEDNESDAY: '수',
    THURSDAY: '목',
    FRIDAY: '금',
    SATURDAY: '토',
    SUNDAY: '일',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return schedules.map((s: any) => {
    const [start, end] = s.timeSlots[0]?.preferredTimeRange?.split(
      ' ~ ',
    ) ?? ['00:00', '00:00']
    return {
      days: [DAY_MAP[s.dayOfWeek] ?? s.dayOfWeek],
      startTime: start,
      endTime: end,
    }
  })
}

/* ============= POST: 예약 신청 (FormData) ============= */
export const postReservation = async (
  reservation: {
    guideId: number
    timeUnit: 'MINUTE_30' | 'MINUTE_60'
    survey: {
      messageToGuide: string
      preferredDate: string
    }
  },
  files: File[],
) => {
  const formData = new FormData()

  // reservation → JSON Blob + 파일명 지정
  const reservationBlob = new Blob([JSON.stringify(reservation)], {
    type: 'application/json',
  })
  formData.append('reservation', reservationBlob, 'reservation.json')

  // files → 여러 개 추가
  files.forEach((file) => {
    formData.append('files', file)
  })

  const res = await api.post('/api/reservations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/* ============= GET: 신청 완료 조회 ============= */
export const getReservationCompletion = async (
  reservationId: number,
) => {
  const res = await api.get(
    `/api/reservations/${reservationId}/completion`,
  )
  console.log('📦 completion API 응답:', res.data)
  return res.data.data
}

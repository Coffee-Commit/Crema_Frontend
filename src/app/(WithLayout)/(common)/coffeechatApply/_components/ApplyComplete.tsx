'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Loading from '@/components/common/LoadingState'
import SquareButton from '@/components/ui/Buttons/SquareButton'
import { getReservationCompletion } from '@/lib/http/reservations'

interface CompletionData {
  reservationId: number
  title: string
  preferredDateOnly: string
  preferredDayOfWeek: string
  preferredTimeRange: string
  price: number
  status: string
}

interface ApplyCompleteProps {
  reservationId: number
}

export default function ApplyComplete({
  reservationId,
}: ApplyCompleteProps) {
  const router = useRouter()
  const [data, setData] = useState<CompletionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReservationCompletion(reservationId)
        setData(res)
      } catch (err) {
        console.error('❌ 완료 데이터 불러오기 실패:', err)
        setError('❌ 데이터를 불러오는 중 오류가 발생했습니다.')
      }
    }
    fetchData()
  }, [reservationId])

  if (error) return <p>{error}</p>
  if (!data) return <Loading />

  return (
    <div className="gap-spacing-5xl container flex h-screen w-[840px] flex-col">
      <div className="border-fill-light border-b">
        <h2 className="font-title2-bold text-label-strong mb-spacing-4xs">
          신청완료
        </h2>
      </div>
      <div className="gap-spacing-lg flex flex-col items-center justify-center text-center">
        <h2 className="font-title2-medium text-label-deep">
          커피챗 신청이 완료되었습니다.
        </h2>
        <table className="font-label4-medium w-full max-w-3xl border-collapse text-left">
          <thead className="bg-fill-input-gray text-label-strong font-label5-regular">
            <tr>
              <th className="px-4 py-3">커피챗 이름</th>
              <th className="px-4 py-3">희망 날짜</th>
              <th className="px-4 py-3">희망 시간</th>
              <th className="px-4 py-3">결제 금액</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-fill-light border-b border-t">
              <td className="font-label4-semibold p-4 py-6">
                {data.title}
              </td>
              <td className="p-4 py-6">
                {' '}
                {data.preferredDateOnly} ({data.preferredDayOfWeek})
              </td>
              <td className="p-4 py-6">{data.preferredTimeRange}</td>
              <td className="font-label4-medium text-label-primary p-4">
                {data.price.toLocaleString()}원
              </td>
            </tr>
          </tbody>
        </table>

        <SquareButton
          variant="primary"
          size="lg"
          className="mt-[80px]"
          onClick={() => router.push('/mypage/rookie/dashboard')}
        >
          신청 상세보기
        </SquareButton>
      </div>
    </div>
  )
}

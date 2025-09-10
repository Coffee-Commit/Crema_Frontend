'use client'

import { useRouter } from 'next/navigation'

import SquareButton from '@/components/ui/Buttons/SquareButton'

export default function ApplyComplete() {
  const router = useRouter()

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
                실내디자인이나 프로덕트 디자인이나 같은 디자인
                아닌가요?
              </td>
              <td className="p-4 py-6">25.08.26 (화)</td>
              <td className="p-4 py-6">19:00 ~ 19:30</td>
              <td className="font-label4-medium text-label-primary p-4">
                8,000원
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

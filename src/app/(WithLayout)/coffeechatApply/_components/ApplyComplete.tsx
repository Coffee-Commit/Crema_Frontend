'use client'

import SquareButton from '@/components/ui/Buttons/SquareButton'

export default function ApplyComplete() {
  return (
    <div className="gap-spacing-lg col-span-12 flex min-h-[640px] flex-col items-center justify-center text-center">
      <h2 className="font-title2 text-label-strong">
        커피챗 신청이 완료되었습니다.
      </h2>

      <table className="font-body3 w-full max-w-3xl border-collapse text-left">
        <thead className="bg-fill-disabled text-label-tertiary font-label4-semibold">
          <tr>
            <th className="px-4 py-2">커피챗 이름</th>
            <th className="px-4 py-2">희망 날짜</th>
            <th className="px-4 py-2">희망 시간</th>
            <th className="px-4 py-2 text-right">결제 금액</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-3">
              실내디자인이나 프로덕트 디자인이나 같은 디자인 아닌가요?
            </td>
            <td className="px-4 py-3">25.08.26 (화)</td>
            <td className="px-4 py-3">19:00 ~ 19:30</td>
            <td className="font-label3-semibold text-semantic-accent px-4 py-3 text-right">
              8,000원
            </td>
          </tr>
        </tbody>
      </table>

      <SquareButton
        variant="primary"
        size="lg"
      >
        신청 상세보기
      </SquareButton>
    </div>
  )
}

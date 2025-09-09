import { RefObject } from 'react'

interface SideBarProps {
  summaryRef: RefObject<HTMLDivElement | null>
  experienceRef: RefObject<HTMLDivElement | null>
  reviewRef: RefObject<HTMLDivElement | null>
  scrollToSection: (ref: RefObject<HTMLDivElement | null>) => void
}

export default function ProfileSidebar({
  summaryRef,
  experienceRef,
  reviewRef,
  scrollToSection,
}: SideBarProps) {
  return (
    <aside className="z-10 -mt-[200px] w-[280px] flex-shrink-0">
      <div className="gap-spacing-sm sticky top-[200px] flex flex-col">
        {/* 멘토 정보 박스 */}
        <div className="bg-fill-white border-border-subtle p-spacing-sm flex flex-col items-center rounded-md border">
          <div className="bg-fill-input-gray size-20 rounded-full" />
          <span className="font-label3-semibold text-label-deep mt-spacing-xs">
            멩파치
          </span>
          <ul className="mt-spacing-xs mb-spacing-sm text-label-default font-caption2-medium text-center">
            <li>직무명 최대16글자</li>
            <li>2년차</li>
            <li>회사명 최대16글자</li>
          </ul>
          <div className="bg-fill-light p-spacing-xs text-label-deep font-caption2-medium w-full gap-1 rounded-md">
            <p>⭐ 4.5 (10)</p>
            <p>👤 15명</p>
            <p>👍 10번 도움 됐어요</p>
          </div>
        </div>

        {/* 예약 버튼 */}
        <button className="bg-fill-primary font-label3-bold py-spacing-xs mt-spacing-sm rounded-md text-white">
          예약하기
        </button>

        {/* HOC 버튼 */}
        <div className="bg-fill-white border-border-subtle mt-spacing-sm px-spacing-sm py-spacing-md flex flex-col gap-2 rounded-md border">
          <button
            onClick={() => scrollToSection(summaryRef)}
            className="font-label4-semibold text-label-default hover:text-fill-primary text-left"
          >
            요약
          </button>
          <button
            onClick={() => scrollToSection(experienceRef)}
            className="font-label4-semibold text-label-default hover:text-fill-primary text-left"
          >
            경험
          </button>
          <button
            onClick={() => scrollToSection(reviewRef)}
            className="font-label4-semibold text-label-default hover:text-fill-primary text-left"
          >
            후기
          </button>
        </div>
      </div>
    </aside>
  )
}

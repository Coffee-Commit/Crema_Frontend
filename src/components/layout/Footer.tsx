'use client'

export default function Footer() {
  return (
    <footer className="bg-fill-footer-gray flex w-full">
      <section className="font-label5-regular text-label-subtle px-container-padding-sm pt-spacing-xs lg:px-container-padding-lg container mx-auto flex w-full flex-col">
        <div className="gap-spacing-xs flex flex-col md:flex-row md:justify-between">
          <div className="flex-start gap-spacing-xs flex flex-col">
            {/* 이용약관 / 개인정보처리방침 등 */}
            <div className="font-label5-semibold flex gap-[19px]">
              <a
                href="#"
                className="hover:underline"
              >
                이용약관
              </a>
              <a
                href="#"
                className="hover:underline"
              >
                개인정보처리방침
              </a>
              <a
                href="#"
                className="hover:underline"
              >
                고객센터
              </a>
              <a
                href="#"
                className="hover:underline"
              >
                운영정책
              </a>
            </div>
            {/* 회사 정보 */}
            <div className="flex gap-[var(--spacing-spacing-xs)]">
              <div className="px-spacing-3xs py-spacing-5xs flex items-center border border-[var(--color-border-subtle)] md:h-[44px]">
                <span className="text-label-default mr-2">
                  이메일 문의
                </span>
                <span>CremaCoffee2025@gmail.com</span>
              </div>
              <div className="px-spacing-3xs py-spacing-5xs flex items-center border border-[var(--color-border-subtle)] md:h-[44px]">
                <span className="text-label-default mr-2">
                  고객센터
                </span>
                <span>02-0000-0000</span>
              </div>
            </div>
          </div>
          <div className="gap-spacing-7xs flex flex-col leading-relaxed text-[var(--color-label-subtle)]">
            <p>(주)커피와커밋 | 대표 : 권재은</p>
            <p>
              서울특별시 마포구 상암로 210, B동 8층 (상암동,
              디지털타워) | 사업자등록번호 : 201-85-43210
            </p>
            <p>
              통신판매업 신고 : 제 2025-서울마포-0321호 |
              직업정보제공사업 : 서울 마포 제 2010-3호
            </p>
          </div>
        </div>
        {/* 저작권 */}
        <div className="border-border-subtle mt-[var(--spacing-spacing-xs)] border-t py-[20px] text-[var(--color-label-subtler)]">
          © 2025 Crema. All rights reserved.
        </div>
      </section>
    </footer>
  )
}

'use client'

import clsx from 'clsx'

export default function Footer() {
  return (
    <footer
      className={clsx(
        'w-full border-t border-[var(--color-border-subtle)] bg-[var(--color-fill-footerGray)]',
      )}
    >
      <div className="container mx-auto flex h-[188px] flex-col items-center justify-end px-[var(--container-padding-lg)] py-6">
        {/* 위쪽 섹션: 이메일 / 고객센터 */}
        <div className="flex w-full items-center justify-between gap-[332px] border-b border-[var(--color-border-subtle)] pb-6">
          {/* 왼쪽: 이용약관 */}
          <div className="flex flex-col gap-1">
            <div className="font-label4-medium flex items-center gap-4 text-[var(--color-label-subtle)]">
              <span>이용약관</span>
              <span>개인정보처리방침</span>
              <span>고객센터</span>
              <span>광고제휴</span>
            </div>
            <div className="font-label4-medium mt-1 flex items-center gap-6 text-[var(--color-label-default)]">
              <div className="flex gap-2">
                <span>이메일 문의</span>
                <span className="underline">
                  CremaCoffee2025@gmail.com
                </span>
              </div>
              <div className="flex gap-2">
                <span>고객센터</span>
                <span>02-0000-0000</span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 회사 정보 */}
          <div className="font-caption3 text-right leading-[18px] text-[var(--color-label-subtle)]">
            <p>(주)커피와커밋 | 대표: 김태호</p>
            <p>
              서울시 서초구 어딘가 2번, 8층 8층 8층, 디지털타워 |
              사업자등록번호: 201-85-43210
            </p>
            <p>
              통신판매 신고 번호: 2025-서울강남-0321 |
              직업정보제공사업자: 서울 마포 제 2010-3호
            </p>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="font-caption3 mt-4 w-full text-[var(--color-label-subtle)]">
          © 2025 Crema. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

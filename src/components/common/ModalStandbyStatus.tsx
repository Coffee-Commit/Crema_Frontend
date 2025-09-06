'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import SquareButton from '@/components/ui/Buttons/SquareButton'

export interface Applicant {
  id: string
  nickname: string
  appliedAt: string
  preferredDate: string
  preferredTime: string
  profileImageUrl?: string | null
}

interface ModalStandbyStatusProps {
  open: boolean
  onClose: () => void
  applicants: Applicant[]
  title: string
}

export default function ModalStandbyStatus({
  open,
  onClose,
  applicants,
  title,
}: ModalStandbyStatusProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-fill-white rounded-2xs w-[840px] max-w-[calc(100vw-32px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 영역 */}
        <div className="px-spacing-2xs py-spacing-4xs border-border-subtler flex flex-row items-center justify-between border-b">
          <span className="font-label3-semibold text-label-deep">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-label-default font-label3-semibold cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* 테이블 */}
        <div className="p-spacing-xs overflow-hidden">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>

            <thead className="border-b-border-light bg-gray-100">
              <tr className="h-12">
                <th className="px-spacing-5xs font-caption3 text-label-strong">
                  닉네임
                </th>
                <th className="px-spacing-5xs font-caption3 text-label-strong">
                  신청일자
                </th>
                <th className="px-spacing-5xs font-caption3 text-label-strong">
                  희망 날짜
                </th>
                <th className="px-spacing-5xs font-caption3 text-label-strong">
                  희망 시간
                </th>
                <th className="px-spacing-5xs font-caption3 text-label-strong text-center">
                  수락 상태
                </th>
              </tr>
            </thead>

            <tbody className="[&>tr]:border-border-subtler [&>tr]:border-t">
              {applicants.map((a) => (
                <tr
                  key={a.id}
                  className="h-14"
                >
                  <td className="px-spacing-5xs">
                    <div className="gap-spacing-2xs flex items-center">
                      <Image
                        src={
                          a.profileImageUrl ||
                          '/images/profileMypage.png'
                        }
                        alt="프로필"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <span className="font-caption2-medium text-label-strong max-w-[280px] truncate">
                        {a.nickname}
                      </span>
                    </div>
                  </td>
                  <td className="px-spacing-5xs">
                    <span className="font-label4-semibold text-label-subtle">
                      {a.appliedAt}
                    </span>
                  </td>
                  <td className="px-spacing-5xs">
                    <span className="font-caption2-medium text-label-strong">
                      {a.preferredDate}
                    </span>
                  </td>
                  <td className="px-spacing-5xs">
                    <span className="font-caption2-medium text-label-strong">
                      {a.preferredTime}
                    </span>
                  </td>
                  <td className="px-spacing-5xs text-center">
                    <div className="gap-spacing-2xs flex items-center justify-between">
                      <button
                        type="button"
                        className="font-caption2-medium text-label-error hover:underline"
                      >
                        거절
                      </button>
                      <SquareButton
                        size="xs"
                        variant="primary"
                      >
                        수락
                      </SquareButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  )
}

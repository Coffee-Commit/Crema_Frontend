'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import api from '@/lib/http/api'

export interface Applicant {
  id: string
  nickname: string
  appliedAt: string
  preferredDate: string
  preferredTime: string
  profileImageUrl?: string | null
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

interface ModalStandbyStatusProps {
  open: boolean
  onClose: () => void
  applicants: Applicant[]
  title: string
}

// ✅ 상태 → UI Label 매핑
const STATUS_LABEL: Record<Applicant['status'], string> = {
  PENDING: '대기중',
  CONFIRMED: '예약됨',
  COMPLETED: '완료',
  CANCELLED: '거절됨',
}
const STATUS_CLASS: Record<Applicant['status'], string> = {
  PENDING: 'text-label-subtle',
  CONFIRMED: 'text-label-primary',
  COMPLETED: 'text-label-default',
  CANCELLED: 'text-label-error',
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yy}.${mm}.${dd} ${hh}:${min}`
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

  const handleDecision = async (
    id: string,
    action: 'CONFIRMED' | 'CANCELLED',
  ) => {
    try {
      const payload = {
        status: action, // ✅ 여기서 그냥 "CONFIRMED" | "CANCELLED"
        ...(action === 'CANCELLED'
          ? { reason: '일정이 맞지 않아 수락이 어렵습니다.' }
          : {}),
      }

      const res = await api.patch(`/api/reservations/${id}`, payload)
      console.log(`✅ 예약 ${action} 성공:`, res.data)

      alert(
        `예약이 ${action === 'CONFIRMED' ? '수락' : '거절'}되었습니다.`,
      )
      window.location.reload()
    } catch (e) {
      console.error(`❌ 예약 ${action} 실패:`, e)
      alert('처리 중 오류가 발생했습니다.')
    }
  }

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
          {applicants.length === 0 ? (
            <div className="flex h-[300px] w-full flex-col items-center justify-center">
              <Image
                src="/images/emptyState.png" // ✅ 원하는 안내 이미지 경로
                alt="데이터 없음"
                width={200}
                height={200}
                className="object-contain"
              />
              <span className="text-label-subtle font-caption2">
                신청하신 커피챗이 없습니다.
              </span>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-left">
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
                        {formatDateTime(a.appliedAt)}
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
                      {a.status === 'PENDING' ? (
                        <div className="gap-spacing-2xs flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(a.id, 'CANCELLED')
                            }
                            className="font-caption2-medium text-label-error hover:underline"
                          >
                            거절
                          </button>
                          <SquareButton
                            size="xs"
                            variant="primary"
                            onClick={() =>
                              handleDecision(a.id, 'CONFIRMED')
                            }
                          >
                            수락
                          </SquareButton>
                        </div>
                      ) : (
                        <span
                          className={`font-caption2-medium ${STATUS_CLASS[a.status]}`}
                        >
                          {STATUS_LABEL[a.status]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

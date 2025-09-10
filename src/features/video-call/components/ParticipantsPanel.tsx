'use client'

import React from 'react'

import {
  useParticipants,
  useParticipantCount,
  useVideoCallActions,
} from '../store'

export default function ParticipantsPanel() {
  const participants = useParticipants()
  const participantCount = useParticipantCount()
  const { pinParticipant } = useVideoCallActions()

  const handlePinParticipant = (participantId: string) => {
    pinParticipant(participantId)
  }

  const formatJoinTime = (joinedAt: Date) => {
    return joinedAt.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-[var(--color-border-subtle)] p-[var(--spacing-spacing-3xs)]">
        <div className="flex items-center justify-between">
          <h3 className="font-label3-semibold text-[var(--color-label-strong)]">
            참가자
          </h3>
          <span className="font-caption rounded-full bg-[var(--color-gray-100)] px-2 py-1 text-[var(--color-label-default)]">
            {participantCount}명
          </span>
        </div>
      </div>

      {/* 참가자 목록 */}
      <div className="flex-1 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="text-[var(--color-label-subtle)]">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mx-auto mb-2"
              >
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.3-1.37-2.16-1.37-.86 0-1.82.35-2.16 1.37L13.5 16H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6l1.8-5.4C8.11 8.64 8.61 8 9.5 8s1.39.64 1.7 1.6L13 15H9v7H8z" />
              </svg>
              <p className="font-body2">참가자가 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-[var(--spacing-spacing-3xs)]">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="group flex items-center justify-between rounded-[var(--radius-sm)] p-[var(--spacing-spacing-6xs)] transition-colors hover:bg-[var(--color-gray-50)]"
              >
                {/* 참가자 정보 */}
                <div className="flex items-center gap-[var(--spacing-spacing-6xs)]">
                  {/* 아바타 */}
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-fill-primary)] bg-opacity-10">
                      <span className="font-label4-medium text-[var(--color-fill-primary)]">
                        {participant.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* 발화 중 표시 */}
                    {participant.speaking && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full bg-[var(--color-fill-primary)]" />
                    )}
                  </div>

                  {/* 이름 및 상태 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-body2 truncate font-medium text-[var(--color-label-strong)]">
                        {participant.nickname}
                      </p>
                      {participant.isLocal && (
                        <span className="font-caption rounded bg-[var(--color-fill-primary)] bg-opacity-10 px-1 py-0.5 text-xs text-[var(--color-fill-primary)]">
                          나
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--color-label-subtle)]">
                      <span>
                        입장 {formatJoinTime(participant.joinedAt)}
                      </span>

                      {/* 화면 공유 표시 */}
                      {participant.isScreenSharing && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--color-fill-primary)]">
                            화면 공유 중
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 참가자 상태 및 액션 */}
                <div className="flex items-center gap-1">
                  {/* 미디어 상태 */}
                  <div className="flex items-center gap-0.5">
                    {/* 오디오 상태 */}
                    <div
                      className={`rounded p-1 ${
                        participant.audioEnabled
                          ? 'text-[var(--color-label-default)]'
                          : 'text-[var(--color-label-error)]'
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        {participant.audioEnabled ? (
                          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        ) : (
                          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99z" />
                        )}
                      </svg>
                    </div>

                    {/* 비디오 상태 */}
                    <div
                      className={`rounded p-1 ${
                        participant.videoEnabled
                          ? 'text-[var(--color-label-default)]'
                          : 'text-[var(--color-label-error)]'
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        {participant.videoEnabled ? (
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        ) : (
                          <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* 메인 화면에 핀 버튼 */}
                  {!participant.isLocal && (
                    <button
                      onClick={() =>
                        handlePinParticipant(participant.id)
                      }
                      className="rounded p-1 opacity-0 transition-opacity hover:bg-[var(--color-gray-200)] group-hover:opacity-100"
                      title="메인 화면에 표시"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

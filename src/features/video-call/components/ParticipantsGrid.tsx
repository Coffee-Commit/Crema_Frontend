'use client'

import React from 'react'

import { useParticipants, useLocalParticipant } from '../store'
import type { Participant } from '../types'
import ParticipantVideo from './ParticipantVideo'

export default function ParticipantsGrid() {
  const participants = useParticipants()
  const _localParticipant = useLocalParticipant()

  // 로컬 참가자를 제외한 원격 참가자들만 표시
  const participantMap = participants as Map<string, Participant>
  const remoteParticipants = Array.from(
    participantMap.values(),
  ).filter((p) => !p.isLocal)

  if (remoteParticipants.length === 0) {
    return null
  }

  return (
    <div className="h-32 border-t border-[var(--color-gray-700)] bg-[var(--color-gray-900)]">
      <div className="flex h-full gap-[var(--spacing-spacing-6xs)] overflow-x-auto p-[var(--spacing-spacing-6xs)]">
        {remoteParticipants.map((participant) => (
          <ParticipantVideo
            key={participant.id}
            participant={participant}
            className="h-full w-24 flex-shrink-0"
          />
        ))}
      </div>
    </div>
  )
}

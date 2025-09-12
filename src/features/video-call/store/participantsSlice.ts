import { StateCreator } from 'zustand'

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type { ParticipantsSlice, Participant } from '../types'

const logger = createOpenViduLogger('ParticipantsSlice')

export const createParticipantsSlice: StateCreator<
  ParticipantsSlice,
  [],
  [],
  ParticipantsSlice
> = (set, get) => ({
  // ============================================================================
  // 상태
  // ============================================================================

  participants: new Map(),
  localParticipantId: null,
  pinnedParticipantId: null,

  // ============================================================================
  // 액션
  // ============================================================================

  addParticipant: (participant: Participant) => {
    const currentState = get()

    // 세션의 내 connectionId와 동일하면 로컬로 보정
    const myConnectionId = (
      currentState as {
        session?: { connection?: { connectionId?: string } }
      }
    ).session?.connection?.connectionId
    const corrected: Participant =
      myConnectionId && participant.connectionId === myConnectionId
        ? { ...participant, isLocal: true }
        : participant

    // 이미 동일 ID 보유 시 스킵
    if (currentState.participants.has(corrected.id)) {
      logger.warn('이미 존재하는 참가자 추가 시도', {
        participantId: corrected.id,
        nickname: corrected.nickname,
      })
      return
    }

    logger.info('참가자 추가', {
      participantId: corrected.id,
      nickname: corrected.nickname,
      isLocal: corrected.isLocal,
    })

    set((state) => {
      const newParticipants = new Map(state.participants)

      // connectionId 기준 중복 제거 (동일 연결의 기존 엔트리 제거)
      for (const [pid, p] of newParticipants) {
        if (
          p.connectionId === corrected.connectionId &&
          pid !== corrected.id
        ) {
          newParticipants.delete(pid)
        }
      }

      newParticipants.set(corrected.id, corrected)

      try {
        logger.debug('참가자 추가(set) 직후 수', {
          size: newParticipants.size,
          added: {
            id: corrected.id,
            conn: corrected.connectionId,
            isLocal: corrected.isLocal,
          },
        })
      } catch {}

      // 로컬 참가자 ID 갱신
      const nextLocalId = corrected.isLocal
        ? corrected.id
        : newParticipants.get(state.localParticipantId || '')?.isLocal
          ? state.localParticipantId
          : state.localParticipantId

      return {
        participants: newParticipants,
        localParticipantId: nextLocalId,
      }
    })
  },

  updateParticipant: (id: string, updates: Partial<Participant>) => {
    const currentState = get()
    const existingParticipant = currentState.participants.get(id)

    if (!existingParticipant) {
      logger.warn('존재하지 않는 참가자 업데이트 시도', {
        participantId: id,
      })
      return
    }

    logger.debug('참가자 정보 업데이트', {
      participantId: id,
      updates: Object.keys(updates),
    })

    set((state) => {
      const newParticipants = new Map(state.participants)
      const updatedParticipant = {
        ...existingParticipant,
        ...updates,
      }
      newParticipants.set(id, updatedParticipant)

      return { participants: newParticipants }
    })
  },

  removeParticipant: (id: string) => {
    const currentState = get()

    if (!currentState.participants.has(id)) {
      logger.warn('존재하지 않는 참가자 제거 시도', {
        participantId: id,
      })
      return
    }

    const participant = currentState.participants.get(id)
    logger.info('참가자 제거', {
      participantId: id,
      nickname: participant?.nickname,
    })

    set((state) => {
      const newParticipants = new Map(state.participants)
      newParticipants.delete(id)

      try {
        logger.debug('참가자 제거(set) 직후 수', {
          size: newParticipants.size,
          removedId: id,
        })
      } catch {}

      return {
        participants: newParticipants,
        // 제거된 참가자가 로컬 참가자인 경우 로컬 ID 초기화
        localParticipantId:
          id === state.localParticipantId
            ? null
            : state.localParticipantId,
        // 제거된 참가자가 핀 설정된 참가자인 경우 핀 해제
        pinnedParticipantId:
          id === state.pinnedParticipantId
            ? null
            : state.pinnedParticipantId,
      }
    })
  },

  pinParticipant: (id: string | null) => {
    const currentState = get()

    // 핀 해제 요청
    if (id === null) {
      logger.debug('참가자 핀 해제')
      set({ pinnedParticipantId: null })
      return
    }

    // 존재하지 않는 참가자 핀 시도
    if (!currentState.participants.has(id)) {
      logger.warn('존재하지 않는 참가자 핀 시도', {
        participantId: id,
      })
      return
    }

    // 이미 핀 설정된 참가자
    if (currentState.pinnedParticipantId === id) {
      logger.debug('이미 핀 설정된 참가자', { participantId: id })
      return
    }

    const participant = currentState.participants.get(id)
    logger.debug('참가자 핀 설정', {
      participantId: id,
      nickname: participant?.nickname,
    })

    set({ pinnedParticipantId: id })
  },

  setSpeaking: (id: string, speaking: boolean) => {
    const currentState = get()
    const participant = currentState.participants.get(id)

    if (!participant) {
      logger.warn('존재하지 않는 참가자 발화 상태 업데이트', {
        participantId: id,
      })
      return
    }

    // 발화 상태가 변경된 경우만 업데이트
    if (participant.speaking !== speaking) {
      logger.debug('참가자 발화 상태 변경', {
        participantId: id,
        nickname: participant.nickname,
        speaking,
      })

      get().updateParticipant(id, { speaking })
    }
  },
})

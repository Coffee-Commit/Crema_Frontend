'use client'

import { create } from 'zustand'

interface ReviewModalState {
  isOpen: boolean
  reservationId?: number
  open: (reservationId: number) => void
  close: () => void
}

export const useReviewModalStore = create<ReviewModalState>(
  (set) => ({
    isOpen: false,
    reservationId: undefined,
    open: (reservationId) => set({ isOpen: true, reservationId }),
    close: () => set({ isOpen: false, reservationId: undefined }),
  }),
)

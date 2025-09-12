'use client'

import { create } from 'zustand'

interface ReviewModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useReviewModalStore = create<ReviewModalState>(
  (set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
  }),
)

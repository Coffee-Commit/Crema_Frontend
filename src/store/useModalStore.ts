'use client'

import { create } from 'zustand'

type ModalContent = {
  title?: string
  message: string
  confirmText?: string
  onConfirm?: () => void
}

type ModalState = {
  isOpen: boolean
  content: ModalContent | null
  openModal: (content: ModalContent) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  openModal: (content) => set({ isOpen: true, content }),
  closeModal: () => set({ isOpen: false, content: null }),
}))

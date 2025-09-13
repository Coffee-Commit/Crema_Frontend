'use client'

import { useReviewModalStore } from '@/store/useReviewModalStore'

import CoffeechatReviewModal from './CoffeechatReviewModal'

export default function CoffeechatReviewModalProvider() {
  const { isOpen, close } = useReviewModalStore()

  return (
    <CoffeechatReviewModal
      isOpen={isOpen}
      onClose={close}
    />
  )
}

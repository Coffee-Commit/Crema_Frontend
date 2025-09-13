'use client'

import { useReviewModalStore } from '@/store/useReviewModalStore'

import CoffeechatReviewModal from './CoffeechatReviewModal'

export default function CoffeechatReviewModalProvider() {
  const { isOpen, close } = useReviewModalStore()

  return (
    <CoffeechatReviewModal
      isOpen={isOpen}
      onClose={close}
      onSubmit={(data) => {
        console.log('📌 리뷰 제출:', data)
        close()
      }}
    />
  )
}

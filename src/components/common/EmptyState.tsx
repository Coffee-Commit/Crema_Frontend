'use client'
import Image from 'next/image'

export default function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center text-center">
      <Image
        src="/images/emptyState.png"
        alt="Empty"
        width={248}
        height={248}
      />
      <p className="font-label4-medium text-label-subtler">
        따뜻한 대화가 당신을 기다리고 있어요.
      </p>
    </div>
  )
}

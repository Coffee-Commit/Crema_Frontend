'use client'

import { ChatMessage } from '@/components/openvidu/types'
import { formatMessageTime } from '@/lib/openvidu/utils'
import clsx from 'clsx'

interface MessageBubbleProps {
  message: ChatMessage
  isOwn?: boolean
}

export default function MessageBubble({
  message,
  isOwn = false,
}: MessageBubbleProps) {
  return (
    <div
      className={clsx(
        'mb-[var(--spacing-spacing-6xs)] flex',
        isOwn ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={clsx(
          'max-w-[80%] rounded-[var(--radius-sm)] px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)]',
          message.type === 'system'
            ? 'mx-auto max-w-full bg-[var(--color-fill-input-gray)] text-center text-[var(--color-label-subtle)]'
            : isOwn
              ? 'rounded-br-none bg-[var(--color-fill-primary)] text-[var(--color-fill-white)]'
              : 'rounded-bl-none bg-[var(--color-fill-input-gray)] text-[var(--color-label-default)]',
        )}
      >
        {message.type === 'user' && !isOwn && (
          <div className="font-caption mb-1 text-xs opacity-75">
            {message.nickname}
          </div>
        )}

        <div className="font-body2 break-words text-sm">
          {message.message}
        </div>

        <div
          className={clsx(
            'font-caption mt-1 text-xs opacity-60',
            message.type === 'system' ? 'text-center' : 'text-right',
          )}
        >
          {formatMessageTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}

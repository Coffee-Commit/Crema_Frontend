'use client'

import { useEffect, useRef } from 'react'

import type { ChatMessage } from '@/components/openvidu/types'
import { useAuthStore } from '@/store/useAuthStore'

import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-[var(--spacing-spacing-md)]">
        <div className="text-center text-[var(--color-label-subtle)]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mx-auto mb-[var(--spacing-spacing-6xs)]"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
          </svg>
          <p className="font-body2">채팅을 시작해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-[var(--spacing-spacing-6xs)]">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.nickname === user?.nickname}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

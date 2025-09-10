'use client'

import React, { useState, useRef, useEffect } from 'react'

import { useChatMessages, useVideoCallActions } from '../store'
import type { ChatMessage } from '../types'

export default function ChatPanel() {
  const messages = useChatMessages()
  const { sendMessage, markAllAsRead } = useVideoCallActions()
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 새 메시지가 추가되면 스크롤을 맨 아래로 이동 (컨테이너 내에서만)
  useEffect(() => {
    const listElement = messagesListRef.current
    if (listElement) {
      listElement.scrollTo({
        top: listElement.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  // 채팅 패널이 활성화되면 읽음 처리
  useEffect(() => {
    markAllAsRead()
  }, [markAllAsRead])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isSending) {
      return
    }

    setIsSending(true)

    try {
      await sendMessage(inputValue.trim())
      setInputValue('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      // 에러는 store에서 처리되므로 여기서는 단순히 로그만
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'system':
        return 'bg-[var(--color-gray-100)] text-[var(--color-label-subtle)] text-center py-1'
      case 'notification':
        return 'bg-[var(--color-fill-primary)] bg-opacity-10 text-[var(--color-label-primary)] text-center py-1'
      default:
        return 'bg-[var(--color-fill-white)]'
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 메시지 목록 */}
      <div
        ref={messagesListRef}
        className="scrollbar-gutter-stable min-h-0 flex-1 overflow-y-auto overscroll-contain p-[var(--spacing-spacing-3xs)]"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="text-[var(--color-label-subtle)]">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mx-auto mb-2"
              >
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <p className="font-body2">
                아직 채팅 메시지가 없습니다
              </p>
              <p className="font-caption text-xs">
                첫 번째 메시지를 보내보세요!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-[var(--spacing-spacing-6xs)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-[var(--radius-sm)] px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] ${getMessageStyle(message)}`}
              >
                {message.type === 'user' && (
                  <div className="mb-[var(--spacing-spacing-7xs)] flex items-center justify-between">
                    <span className="font-caption font-medium text-[var(--color-label-strong)]">
                      {message.senderName}
                    </span>
                    <span className="font-caption text-xs text-[var(--color-label-subtle)]">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                )}

                <div
                  className={`${message.type === 'user' ? 'font-body2' : 'font-caption'}`}
                >
                  {message.content}
                </div>

                {message.type !== 'user' && (
                  <div className="mt-1 text-xs text-[var(--color-label-subtle)]">
                    {formatTimestamp(message.timestamp)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 */}
      <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-[var(--spacing-spacing-3xs)]">
        <form
          onSubmit={handleSendMessage}
          className="flex gap-[var(--spacing-spacing-6xs)]"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isSending}
            className="font-body2 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] px-[var(--spacing-spacing-6xs)] py-[var(--spacing-spacing-7xs)] transition-colors focus:border-[var(--color-fill-primary)] focus:outline-none disabled:bg-[var(--color-gray-100)] disabled:text-[var(--color-label-subtle)]"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] transition-all ${
              inputValue.trim() && !isSending
                ? 'bg-[var(--color-fill-primary)] text-[var(--color-fill-white)] hover:brightness-110'
                : 'cursor-not-allowed bg-[var(--color-gray-200)] text-[var(--color-label-subtle)]'
            }`}
          >
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

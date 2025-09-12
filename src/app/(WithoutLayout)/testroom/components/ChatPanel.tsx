'use client'

import { useEffect, useRef, useState } from 'react'

import type { LocalChatMessage } from '../types'

type Props = {
  messages: LocalChatMessage[]
  onSend: (text: string) => void | Promise<void>
  isActive?: boolean
}

export default function ChatPanel({
  messages,
  onSend,
  isActive = true,
}: Props) {
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, isActive])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    await onSend(text)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[8px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto rounded-[8px]"
      >
        <ul className="space-y-6">
          {messages.map((m) => (
            <li
              key={m.id}
              className="flex gap-3"
            >
              <span className="mt-[2px] inline-block h-8 w-8 shrink-0 rounded-full bg-gray-300" />
              <div className="flex flex-col">
                <div className="mb-1 text-[12px] text-[#9CA3AF]">
                  <span className="mr-2 text-[#6B7280]">
                    {m.name}
                  </span>
                  <span>{m.time}</span>
                </div>
                <div className="text-[14px] font-semibold text-[#111827]">
                  {m.text}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            const native = e.nativeEvent as unknown as {
              isComposing?: boolean
            }
            const nativeComposing = native.isComposing ?? false
            if (
              e.key === 'Enter' &&
              !isComposing &&
              !nativeComposing
            ) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="메시지를 입력하세요..."
          className="h-[44px] w-full rounded-[8px] border border-[#E5E7EB] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF] focus:border-[#EB5F27]"
        />
        <button
          type="button"
          onClick={handleSend}
          className="h-[44px] w-[80px] rounded-[8px] bg-[#EB5F27] px-5 text-[14px] font-semibold text-white hover:brightness-95"
        >
          전송
        </button>
      </div>
    </div>
  )
}

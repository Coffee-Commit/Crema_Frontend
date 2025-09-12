'use client'

import type { ChatMessage } from '@/components/openvidu/types'

import MessageInput from './MessageInput'
import MessageList from './MessageList'

interface ChatContainerProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => Promise<void>
}

export default function ChatContainer({
  messages,
  onSendMessage,
}: ChatContainerProps) {
  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={onSendMessage} />
    </div>
  )
}

'use client'

import MessageInput from './MessageInput'
import MessageList from './MessageList'

export default function ChatContainer() {
  return (
    <div className="flex h-full flex-col">
      <MessageList />
      <MessageInput />
    </div>
  )
}

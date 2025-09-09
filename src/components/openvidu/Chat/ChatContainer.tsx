'use client'

import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatContainer() {
  return (
    <div className="flex h-full flex-col">
      <MessageList />
      <MessageInput />
    </div>
  )
}

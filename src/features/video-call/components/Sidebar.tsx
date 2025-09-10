'use client'

import React from 'react'

import {
  useActiveTab,
  useShouldShowChatBadge,
  useUIState,
  useVideoCallActions,
} from '../store'
import ChatPanel from './ChatPanel'
import NetworkPanel from './NetworkPanel'
import ParticipantsPanel from './ParticipantsPanel'
import type { SidebarTab } from '../types'

export default function Sidebar() {
  const activeTab = useActiveTab()
  const shouldShowChatBadge = useShouldShowChatBadge()
  const uiState = useUIState()
  const { setActiveTab } = useVideoCallActions()

  if (!uiState.sidebarVisible) {
    return null
  }

  const tabs: Array<{
    id: SidebarTab
    label: string
    icon: React.ReactNode
    badge?: boolean
  }> = [
    {
      id: 'chat',
      label: '채팅',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      ),
      badge: shouldShowChatBadge,
    },
    {
      id: 'participants',
      label: '참가자',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.3-1.37-2.16-1.37-.86 0-1.82.35-2.16 1.37L13.5 16H16v6h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H6l1.8-5.4C8.11 8.64 8.61 8 9.5 8s1.39.64 1.7 1.6L13 15H9v7H8z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: '설정',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      ),
    },
    {
      id: 'network',
      label: '네트워크',
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
        </svg>
      ),
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPanel />
      case 'participants':
        return <ParticipantsPanel />
      case 'settings':
        return (
          <div className="p-4 text-center text-[var(--color-label-subtle)]">
            설정 패널 준비 중
          </div>
        )
      case 'network':
        return <NetworkPanel />
      default:
        return (
          <div className="p-4 text-center text-[var(--color-label-subtle)]">
            패널을 선택해주세요
          </div>
        )
    }
  }

  return (
    <div className="flex w-80 flex-col border-l border-[var(--color-border-subtle)] bg-[var(--color-fill-white)]">
      {/* 탭 헤더 */}
      <div className="flex border-b border-[var(--color-border-subtle)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-label4-medium relative flex-1 px-[var(--spacing-spacing-2xs)] py-[var(--spacing-spacing-3xs)] transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-[var(--color-label-primary)] text-[var(--color-label-primary)]'
                : 'text-[var(--color-label-default)] hover:text-[var(--color-label-strong)]'
            }`}
            title={tab.label}
          >
            <div className="flex items-center justify-center">
              {tab.icon}

              {/* 배지 표시 */}
              {tab.badge && (
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--color-label-error)]" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  )
}

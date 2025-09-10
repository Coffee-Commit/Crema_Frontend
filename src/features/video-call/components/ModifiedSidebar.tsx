'use client'

import React, { useState } from 'react'

import { useUnreadCount } from '../store'
import ChatPanel from './ChatPanel'
import MaterialsPanel from './MaterialsPanel'

type ModifiedSidebarTab = 'chat' | 'materials'

export default function ModifiedSidebar() {
  const [activeTab, setActiveTab] =
    useState<ModifiedSidebarTab>('materials') // 기본 선택: 공유된 자료
  const unreadCount = useUnreadCount()

  const tabs: Array<{
    id: ModifiedSidebarTab
    label: string
    badge?: number
  }> = [
    {
      id: 'chat',
      label: '채팅',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'materials',
      label: '공유된 자료',
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPanel />
      case 'materials':
        return <MaterialsPanel />
      default:
        return (
          <div className="p-4 text-center text-[var(--color-label-subtle)]">
            패널을 선택해주세요
          </div>
        )
    }
  }

  return (
    <div className="flex h-full w-80 flex-col overflow-hidden border-l border-[var(--color-border-subtle)] bg-[var(--color-fill-white)]">
      {/* 탭 헤더 */}
      <div className="flex shrink-0 border-b border-[var(--color-border-subtle)]">
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
            <span>{tab.label}</span>

            {/* 배지 표시 */}
            {tab.badge && tab.badge > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-label-error)] px-1 text-xs font-medium text-white">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  )
}

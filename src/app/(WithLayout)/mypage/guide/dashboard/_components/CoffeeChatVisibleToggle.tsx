'use client'

import { useEffect, useState } from 'react'
import LabeledToggle from '@/components/ui/Toggle/LabledToggle'
import api from '@/lib/http/api'
import { useAuthStore } from '@/store/useAuthStore'

export default function GuideVisibilityToggle() {
  const [opened, setOpened] = useState<boolean>(true)
  const [_loading, setLoading] = useState(false)

  const guideId = useAuthStore((s) => s.guideId)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  // ✅ 초기값 불러오기
  useEffect(() => {
    const fetchInitial = async () => {
      if (!isHydrated) return
      if (!guideId) {
        console.warn('⚠️ guideId 없음 → 공개 상태 불러오기 불가')
        return
      }
      try {
        // ✅ 스펙에 맞게 수정
        const res = await api.get(
          `/api/guides/${guideId}/coffeechats`,
        )
        const state = res.data.data.isOpened ?? res.data.data.opened
        setOpened(state ?? true)
      } catch (err) {
        console.error('❌ 초기 공개 상태 불러오기 실패:', err)
      }
    }
    fetchInitial()
  }, [isHydrated, guideId])

  // ✅ 토글 핸들러
  const handleToggle = async (value: boolean) => {
    setOpened(value)
    setLoading(true)
    try {
      await api.patch('/api/guides/me/visibility', {
        isOpened: value,
      })
      console.log('✅ 공개 상태 변경 성공:', value)
    } catch (err) {
      console.error('❌ 공개 상태 변경 실패:', err)
      setOpened(!value) // 실패 시 롤백
    } finally {
      setLoading(false)
    }
  }

  return (
    <LabeledToggle
      label="커피챗 공개 여부"
      checked={opened}
      onChange={handleToggle}
    />
  )
}

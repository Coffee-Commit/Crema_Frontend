'use client'

import { useEffect, useState } from 'react'

import LabeledToggle from '@/components/ui/Toggle/LabledToggle'
import api from '@/lib/http/api'

export default function GuideVisibilityToggle() {
  const [opened, setOpened] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)

  // ✅ 초기값 불러오기
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await api.get('/api/guides/me/coffeechats')
        setOpened(res.data.data.opened) // 👈 응답에서 opened만 사용
      } catch (err) {
        console.error('❌ 초기 공개 상태 불러오기 실패:', err)
      }
    }
    fetchInitial()
  }, [])

  // ✅ 토글 핸들러
  const handleToggle = async (value: boolean) => {
    setOpened(value)
    setLoading(true)
    try {
      await api.patch('/api/guides/me/visibility', { opened: value })
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
      label={loading ? '커피챗 공개 여부' : '커피챗 공개 여부'}
      checked={opened}
      onChange={handleToggle}
    />
  )
}

'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <main className="py-3unit container space-y-4">
      <h1 className="text-2xl font-bold">🧪 컴포넌트 테스트</h1>

      <section className="space-y-2">
        <Button onClick={() => setOpen(true)}>모달 열기</Button>
        <Input
          label="이메일"
          placeholder="you@example.com"
        />
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="모달 테스트"
      >
        <p>Tailwind v4 테마 기반 모달입니다.</p>
      </Modal>
    </main>
  )
}

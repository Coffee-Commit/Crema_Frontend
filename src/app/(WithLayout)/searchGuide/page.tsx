import { Suspense } from 'react'

import MentorPage from './_components/MentorPage'

export default function SearchGuidePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MentorPage />
    </Suspense>
  )
}

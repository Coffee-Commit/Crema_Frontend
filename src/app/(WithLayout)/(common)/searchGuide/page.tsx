import { Suspense } from 'react'

import Loading from '@/components/common/LoadingState'

import MentorPage from './_components/MentorPage'

export default function SearchGuidePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MentorPage />
    </Suspense>
  )
}

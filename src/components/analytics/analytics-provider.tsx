'use client'

import { Suspense } from 'react'
import { PageViewTracker } from '@/components/analytics/page-view-tracker'

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  )
}

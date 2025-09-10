// 페이지 관련 타입 정의

// Next.js 15 페이지 파라미터 타입 (Promise 기반)
export interface PageParams {
  sessionId: string
  id: string
}

export interface SearchParams {
  username?: string
  sessionName?: string
  reservationId?: string
  [key: string]: string | string[] | undefined
}

export interface VideoCallPageProps {
  params: Promise<PageParams>
  searchParams?: Promise<SearchParams>
}

export interface TestRoomPageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    username?: string
    sessionName?: string
  }>
}

export interface CoffeeChatPageProps {
  params: Promise<{ sessionId: string }>
  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >
}

// 환경 정보 타입
export interface EnvironmentInfo {
  hasVideoDevice: boolean
  hasAudioDevice: boolean
  browserInfo: {
    name: string
    version: string
    userAgent: string
  }
  screenInfo: {
    width: number
    height: number
    devicePixelRatio: number
  }
  networkInfo?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

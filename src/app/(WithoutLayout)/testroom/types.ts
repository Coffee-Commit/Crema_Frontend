export type TabType = 'chat' | 'files'

export type SharedFile = {
  id: string
  name: string
  sizeBytes: number
  content: string
  mime: string
  url?: string // API 방식에서 파일 다운로드 URL
}

export type LocalChatMessage = {
  id: string
  who: 'me' | 'other'
  name: string
  time: string
  text: string
}


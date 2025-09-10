// 타입 가드 유틸리티 함수들

/**
 * unknown 타입을 Record<string, unknown>으로 안전하게 변환하는 타입 가드
 */
export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * API 응답 형태의 객체인지 확인하는 타입 가드
 */
export function isApiResponseLike(
  obj: unknown,
): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('code' in obj ||
      'resultCode' in obj ||
      'success' in obj ||
      'result' in obj ||
      'data' in obj)
  )
}

/**
 * 채팅 메시지 데이터 타입 가드
 */
export function isChatMessageLike(
  data: unknown,
): data is Record<string, unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'message' in data &&
    'timestamp' in data &&
    'username' in data
  )
}

/**
 * 채팅 메시지 청크 데이터 타입 가드
 */
export function isChatChunkLike(
  chunk: unknown,
): chunk is Record<string, unknown> {
  return (
    typeof chunk === 'object' &&
    chunk !== null &&
    'id' in chunk &&
    'messageId' in chunk &&
    'chunkIndex' in chunk &&
    'totalChunks' in chunk &&
    'data' in chunk &&
    'timestamp' in chunk
  )
}

/**
 * 에러 객체인지 확인하는 타입 가드
 */
export function isErrorLike(
  error: unknown,
): error is Error & Record<string, unknown> {
  return (
    error instanceof Error ||
    (typeof error === 'object' &&
      error !== null &&
      ('message' in error || 'name' in error))
  )
}

/**
 * 참가자 데이터 타입 가드
 */
export function isParticipantDataLike(
  data: unknown,
): data is Record<string, unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('id' in data || 'connectionId' in data || 'isLocal' in data)
  )
}

/**
 * unknown을 string으로 안전하게 변환
 */
export function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/**
 * unknown을 number로 안전하게 변환
 */
export function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

/**
 * unknown을 boolean으로 안전하게 변환
 */
export function safeBoolean(
  value: unknown,
  fallback = false,
): boolean {
  return typeof value === 'boolean' ? value : fallback
}

/**
 * OpenVidu 어댑터 모듈 익스포트
 */

// 기본 어댑터 인터페이스 및 타입들
export type {
  OpenViduSdkAdapter,
  AdapterFactory,
  AdapterPublisherConfig,
  AdapterSessionConfig,
  AdapterEventHandlers,
  PerformanceMetrics,
  AdapterState,
} from './base'

export { AdapterError } from './base'

// 구체적인 어댑터 구현들
export { OpenViduV2CompatibilityAdapter } from './v2compatibility'

// 어댑터 팩토리
export {
  OpenViduAdapterFactory,
  createDefaultAdapter,
  createAdapter,
  getAdapterFactory,
} from './factory'

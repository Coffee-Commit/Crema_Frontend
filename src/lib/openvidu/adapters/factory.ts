/**
 * OpenVidu SDK 어댑터 팩토리
 * 환경 설정에 따라 적절한 어댑터를 생성
 */

import {
  featureFlags,
  type OpenViduSdkVersion,
} from '@/lib/config/env'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

import type { OpenViduSdkAdapter, AdapterFactory } from './base'
import { OpenViduV2CompatibilityAdapter } from './v2compatibility'

const logger = createOpenViduLogger('AdapterFactory')

/**
 * OpenVidu 어댑터 팩토리 구현
 */
export class OpenViduAdapterFactory implements AdapterFactory {
  private static instance: OpenViduAdapterFactory | null = null
  private adapterCache: Map<OpenViduSdkVersion, OpenViduSdkAdapter> =
    new Map()

  private constructor() {
    logger.info('어댑터 팩토리 초기화', {
      defaultSdk: featureFlags.openviduSdkVersion,
      availableVersions: this.getSupportedVersions(),
    })
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): OpenViduAdapterFactory {
    if (!OpenViduAdapterFactory.instance) {
      OpenViduAdapterFactory.instance = new OpenViduAdapterFactory()
    }
    return OpenViduAdapterFactory.instance
  }

  /**
   * SDK 버전에 따른 어댑터 생성
   */
  createAdapter(sdkVersion: OpenViduSdkVersion): OpenViduSdkAdapter {
    // 캐시된 어댑터가 있으면 재사용
    if (this.adapterCache.has(sdkVersion)) {
      const cachedAdapter = this.adapterCache.get(sdkVersion)!
      logger.debug('캐시된 어댑터 사용', { sdkVersion })
      return cachedAdapter
    }

    let adapter: OpenViduSdkAdapter

    switch (sdkVersion) {
      case 'v2compatibility':
        adapter = new OpenViduV2CompatibilityAdapter()
        break

      case 'v3native':
        // TODO: v3 네이티브 어댑터 구현 시 추가
        logger.warn(
          'v3 네이티브 어댑터는 아직 구현되지 않았습니다. v2 호환성 모드를 사용합니다.',
        )
        adapter = new OpenViduV2CompatibilityAdapter()
        break

      default:
        logger.error('지원하지 않는 SDK 버전', { sdkVersion })
        throw new Error(`지원하지 않는 SDK 버전: ${sdkVersion}`)
    }

    // 어댑터 캐싱
    this.adapterCache.set(sdkVersion, adapter)

    logger.info('새 어댑터 생성 완료', {
      sdkVersion,
      adapterType: adapter.constructor.name,
      version: adapter.version,
      compatibility: adapter.compatibility,
    })

    return adapter
  }

  /**
   * 지원하는 SDK 버전 목록 반환
   */
  getSupportedVersions(): string[] {
    return ['v2compatibility'] // v3native는 추후 구현 예정
  }

  /**
   * 현재 기본 어댑터 생성
   */
  createDefaultAdapter(): OpenViduSdkAdapter {
    return this.createAdapter(featureFlags.openviduSdkVersion)
  }

  /**
   * 특정 어댑터 캐시 제거
   */
  removeFromCache(sdkVersion: OpenViduSdkVersion): void {
    const adapter = this.adapterCache.get(sdkVersion)
    if (adapter) {
      adapter.cleanup()
      this.adapterCache.delete(sdkVersion)
      logger.debug('어댑터 캐시 제거', { sdkVersion })
    }
  }

  /**
   * 모든 어댑터 캐시 정리
   */
  clearCache(): void {
    for (const [sdkVersion, adapter] of this.adapterCache) {
      adapter.cleanup()
    }
    this.adapterCache.clear()
    logger.info('모든 어댑터 캐시 정리 완료')
  }

  /**
   * 어댑터 상태 정보 반환
   */
  getAdapterInfo(): Array<{
    sdkVersion: OpenViduSdkVersion
    adapter: OpenViduSdkAdapter
    state: any
  }> {
    const info = []

    for (const [sdkVersion, adapter] of this.adapterCache) {
      info.push({
        sdkVersion,
        adapter,
        state: (adapter as any).getState?.() || {},
      })
    }

    return info
  }

  /**
   * 런타임 어댑터 전환 (개발/테스트 용도)
   */
  switchAdapter(
    newSdkVersion: OpenViduSdkVersion,
  ): OpenViduSdkAdapter {
    logger.warn('런타임 어댑터 전환', {
      from: featureFlags.openviduSdkVersion,
      to: newSdkVersion,
    })

    // 기존 어댑터 정리
    this.removeFromCache(featureFlags.openviduSdkVersion)

    // 새 어댑터 생성
    const newAdapter = this.createAdapter(newSdkVersion)

    // 피처 플래그 업데이트 (런타임에서만)
    featureFlags.openviduSdkVersion = newSdkVersion

    return newAdapter
  }
}

/**
 * 편의 함수들
 */

/**
 * 기본 어댑터 인스턴스 생성
 */
export function createDefaultAdapter(): OpenViduSdkAdapter {
  return OpenViduAdapterFactory.getInstance().createDefaultAdapter()
}

/**
 * 특정 SDK 버전의 어댑터 생성
 */
export function createAdapter(
  sdkVersion: OpenViduSdkVersion,
): OpenViduSdkAdapter {
  return OpenViduAdapterFactory.getInstance().createAdapter(
    sdkVersion,
  )
}

/**
 * 어댑터 팩토리 인스턴스 반환
 */
export function getAdapterFactory(): OpenViduAdapterFactory {
  return OpenViduAdapterFactory.getInstance()
}

// 개발 환경에서 글로벌 액세스 제공
if (typeof window !== 'undefined' && featureFlags.debugMode) {
  ;(window as any).openviduAdapterFactory =
    OpenViduAdapterFactory.getInstance

  console.log('🔧 OpenVidu 어댑터 개발 도구 활성화')
}

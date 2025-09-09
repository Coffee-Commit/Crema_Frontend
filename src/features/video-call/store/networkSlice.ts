import { StateCreator } from 'zustand'
import type { NetworkSlice, NetworkQuality } from '../types'
import { createOpenViduLogger } from '@/lib/utils/openviduLogger'
import { VIDEO_CALL_CONSTANTS } from '../types'

const logger = createOpenViduLogger('NetworkSlice')

export const createNetworkSlice: StateCreator<
  NetworkSlice,
  [],
  [],
  NetworkSlice
> = (set, get) => ({
  // ============================================================================
  // 상태
  // ============================================================================
  
  quality: null,
  connectionStats: new Map(),
  monitoring: false,

  // ============================================================================
  // 액션
  // ============================================================================
  
  updateQuality: (quality: NetworkQuality) => {
    const currentState = get()
    
    logger.debug('네트워크 품질 업데이트', {
      level: quality.level,
      latency: quality.latency,
      jitter: quality.jitter,
      packetLoss: quality.packetLoss,
      bandwidth: quality.bandwidth
    })

    // 품질 레벨이 현저히 떨어진 경우 경고 로그
    if (currentState.quality && quality.level < currentState.quality.level - 1) {
      logger.warn('네트워크 품질 급격한 저하', {
        previousLevel: currentState.quality.level,
        currentLevel: quality.level,
        latency: quality.latency,
        packetLoss: quality.packetLoss
      })
    }

    set({ quality })
  },

  updateParticipantStats: (participantId: string, stats: NetworkQuality) => {
    const currentState = get()
    
    logger.debug('참가자 네트워크 통계 업데이트', {
      participantId,
      level: stats.level,
      latency: stats.latency
    })

    set((state) => {
      const newConnectionStats = new Map(state.connectionStats)
      newConnectionStats.set(participantId, stats)
      return { connectionStats: newConnectionStats }
    })
  },

  startMonitoring: () => {
    const currentState = get()
    
    if (currentState.monitoring) {
      logger.warn('이미 네트워크 모니터링 중')
      return
    }

    logger.info('네트워크 모니터링 시작')
    
    set({ monitoring: true })

    // 네트워크 품질 주기적 체크
    const monitoringInterval = setInterval(async () => {
      const state = get()
      
      // 모니터링이 중지된 경우 인터벌 정리
      if (!state.monitoring) {
        clearInterval(monitoringInterval)
        return
      }

      try {
        // TODO: 실제 네트워크 통계 수집
        // const stats = await openViduClient.getNetworkStats()
        // get().updateQuality(stats)
        
        logger.debug('네트워크 품질 체크 완료')
        
      } catch (error) {
        logger.error('네트워크 품질 체크 실패', {
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        })
      }
    }, VIDEO_CALL_CONSTANTS.NETWORK_CHECK_INTERVAL)

    // 컴포넌트 언마운트 시 정리를 위해 인터벌 ID 저장
    // 실제 구현에서는 ref나 클래스 속성으로 관리할 수 있음
  },

  stopMonitoring: () => {
    const currentState = get()
    
    if (!currentState.monitoring) {
      logger.debug('이미 네트워크 모니터링 중지됨')
      return
    }

    logger.info('네트워크 모니터링 중지')
    
    set({ 
      monitoring: false,
      quality: null,
      connectionStats: new Map()
    })
  },

  // ============================================================================
})

// ============================================================================
// 네트워크 품질 분석 유틸리티 (외부 함수)
// ============================================================================

export const getQualityLevel = (get: any): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' => {
    const quality = get().quality
    
    if (!quality) return 'unknown'
    
    if (quality.level >= 4) return 'excellent'
    if (quality.level >= 3) return 'good'
    if (quality.level >= 2) return 'fair'
    return 'poor'
}

export const getQualityDescription = (get: any): string => {
    const quality = get().quality
    
    if (!quality) return '네트워크 상태를 확인할 수 없습니다'
    
    const level = getQualityLevel(get)
    
    switch (level) {
      case 'excellent':
        return '네트워크 상태가 매우 좋습니다'
      case 'good':
        return '네트워크 상태가 좋습니다'
      case 'fair':
        return '네트워크 상태가 보통입니다'
      case 'poor':
        return '네트워크 상태가 나쁩니다'
      default:
        return '네트워크 상태를 확인할 수 없습니다'
    }
  }

export const shouldShowNetworkWarning = (get: any): boolean => {
    const quality = get().quality
    
    if (!quality) return false
    
    // 품질 레벨이 2 이하이거나, 지연시간이 높거나, 패킷 손실이 높은 경우
    return (
      quality.level <= 2 ||
      quality.latency > 200 ||
      quality.packetLoss > 0.03
    )
  }

export const getNetworkRecommendations = (get: any): string[] => {
    const quality = get().quality
    const recommendations: string[] = []
    
    if (!quality) {
      return ['네트워크 상태를 확인할 수 없습니다']
    }

    if (quality.latency > 150) {
      recommendations.push('지연시간이 높습니다. 네트워크 연결을 확인해주세요')
    }

    if (quality.packetLoss > 0.02) {
      recommendations.push('패킷 손실이 발생하고 있습니다. 안정적인 네트워크로 연결해주세요')
    }

    if (quality.bandwidth.upload < 500) {
      recommendations.push('업로드 대역폭이 부족합니다. 비디오 품질을 낮춰보세요')
    }

    if (quality.bandwidth.download < 500) {
      recommendations.push('다운로드 대역폭이 부족합니다. 다른 네트워크 사용을 줄여보세요')
    }

    if (recommendations.length === 0) {
      recommendations.push('네트워크 상태가 좋습니다')
    }

    return recommendations
  }

// 참가자별 네트워크 상태 요약
export const getParticipantsNetworkSummary = (get: any) => {
    const connectionStats = get().connectionStats
    const summary = {
      total: connectionStats.size,
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0
    }

    connectionStats.forEach((stats: any) => {
      if (stats.level >= 4) summary.excellent++
      else if (stats.level >= 3) summary.good++
      else if (stats.level >= 2) summary.fair++
      else summary.poor++
    })

    return summary
}
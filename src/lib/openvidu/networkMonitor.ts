/**
 * LiveKit 스타일 네트워크 품질 모니터링
 * OpenVidu v3에서 개선된 네트워크 상태 추적
 */

import { createOpenViduLogger } from '@/lib/utils/openviduLogger'

const logger = createOpenViduLogger('NetworkMonitor')

export interface NetworkQualityInfo {
  level: number // 1-5 (1: poor, 5: excellent)
  latency: number // RTT in ms
  jitter: number // jitter in ms
  packetLoss: number // packet loss percentage
  bandwidth: {
    upload: number // kbps
    download: number // kbps
  }
  timestamp: Date
}

export interface ConnectionStats {
  bytesReceived: number
  bytesSent: number
  packetsReceived: number
  packetsSent: number
  packetsLost: number
  currentRTT: number
  availableOutgoingBitrate: number
  availableIncomingBitrate: number
}

/**
 * 네트워크 품질 모니터링 클래스
 */
export class NetworkQualityMonitor {
  private intervalId: number | null = null
  private previousStats: ConnectionStats | null = null
  private qualityHistory: NetworkQualityInfo[] = []
  private readonly maxHistoryLength = 20

  constructor(
    private session: any, // OpenVidu Session
    private onQualityUpdate: (quality: NetworkQualityInfo) => void,
    private monitorInterval: number = 5000, // 5초마다 확인
  ) {}

  /**
   * 모니터링 시작
   */
  start(): void {
    if (this.intervalId) {
      logger.warn('네트워크 모니터링이 이미 실행 중입니다.')
      return
    }

    logger.info('네트워크 품질 모니터링 시작')

    this.intervalId = window.setInterval(() => {
      this.checkNetworkQuality()
    }, this.monitorInterval)

    // 즉시 한 번 실행
    this.checkNetworkQuality()
  }

  /**
   * 모니터링 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      logger.info('네트워크 품질 모니터링 중지')
    }
  }

  /**
   * 네트워크 품질 확인
   */
  private async checkNetworkQuality(): Promise<void> {
    if (!this.session) return

    try {
      // OpenVidu의 Publisher에서 통계 정보 가져오기
      const publishers = this.session.streamManagers.filter(
        (sm: any) => sm.stream.local,
      )

      if (publishers.length === 0) return

      const publisher = publishers[0]

      // WebRTC stats 수집
      const stats = await this.getWebRTCStats(publisher)

      if (stats) {
        const quality = this.calculateQuality(stats)
        this.updateQualityHistory(quality)
        this.onQualityUpdate(quality)
      }
    } catch (error) {
      logger.error('네트워크 품질 확인 실패', { error })
    }
  }

  /**
   * WebRTC 통계 정보 수집
   */
  private async getWebRTCStats(
    streamManager: any,
  ): Promise<ConnectionStats | null> {
    try {
      const webRtcPeer = streamManager.stream.webRtcPeer

      if (!webRtcPeer || !webRtcPeer.pc) {
        return null
      }

      const peerConnection = webRtcPeer.pc
      const stats = await peerConnection.getStats()

      const connectionStats: ConnectionStats = {
        bytesReceived: 0,
        bytesSent: 0,
        packetsReceived: 0,
        packetsSent: 0,
        packetsLost: 0,
        currentRTT: 0,
        availableOutgoingBitrate: 0,
        availableIncomingBitrate: 0,
      }

      stats.forEach((report: any) => {
        if (
          report.type === 'inbound-rtp' &&
          report.mediaType === 'video'
        ) {
          connectionStats.bytesReceived = report.bytesReceived || 0
          connectionStats.packetsReceived =
            report.packetsReceived || 0
          connectionStats.packetsLost = report.packetsLost || 0
        } else if (
          report.type === 'outbound-rtp' &&
          report.mediaType === 'video'
        ) {
          connectionStats.bytesSent = report.bytesSent || 0
          connectionStats.packetsSent = report.packetsSent || 0
        } else if (
          report.type === 'candidate-pair' &&
          report.state === 'succeeded'
        ) {
          connectionStats.currentRTT =
            report.currentRoundTripTime * 1000 || 0 // ms로 변환
        }
      })

      return connectionStats
    } catch (error) {
      logger.debug('WebRTC 통계 수집 실패', { error })
      return null
    }
  }

  /**
   * 네트워크 품질 계산
   */
  private calculateQuality(
    stats: ConnectionStats,
  ): NetworkQualityInfo {
    const now = new Date()

    // 이전 통계와 비교하여 품질 계산
    let level = 5 // 기본값: 최고 품질
    let packetLossRate = 0
    const jitter = 0

    if (this.previousStats) {
      const timeDiff =
        now.getTime() -
        (this.qualityHistory[
          this.qualityHistory.length - 1
        ]?.timestamp.getTime() || now.getTime())
      const timeDiffSec = timeDiff / 1000

      if (timeDiffSec > 0) {
        const receivedDiff =
          stats.packetsReceived - this.previousStats.packetsReceived
        const lostDiff = Math.max(
          0,
          stats.packetsLost - this.previousStats.packetsLost,
        )

        if (receivedDiff + lostDiff > 0) {
          packetLossRate =
            (lostDiff / (receivedDiff + lostDiff)) * 100
        }
      }
    }

    // RTT 기반 품질 계산
    if (stats.currentRTT > 300)
      level = Math.min(level, 1) // Poor
    else if (stats.currentRTT > 200)
      level = Math.min(level, 2) // Fair
    else if (stats.currentRTT > 100)
      level = Math.min(level, 3) // Good
    else if (stats.currentRTT > 50) level = Math.min(level, 4) // Very Good
    // else level 5 (Excellent)

    // 패킷 손실률 기반 품질 조정
    if (packetLossRate > 5) level = Math.min(level, 1)
    else if (packetLossRate > 2) level = Math.min(level, 2)
    else if (packetLossRate > 1) level = Math.min(level, 3)
    else if (packetLossRate > 0.5) level = Math.min(level, 4)

    // 대역폭 추정 (간단한 계산)
    const uploadBandwidth = stats.availableOutgoingBitrate / 1000 || 0 // kbps
    const downloadBandwidth =
      stats.availableIncomingBitrate / 1000 || 0 // kbps

    const quality: NetworkQualityInfo = {
      level,
      latency: stats.currentRTT,
      jitter,
      packetLoss: packetLossRate,
      bandwidth: {
        upload: uploadBandwidth,
        download: downloadBandwidth,
      },
      timestamp: now,
    }

    this.previousStats = { ...stats }

    logger.debug('네트워크 품질 계산', quality as unknown as Record<string, unknown>)

    return quality
  }

  /**
   * 품질 히스토리 업데이트
   */
  private updateQualityHistory(quality: NetworkQualityInfo): void {
    this.qualityHistory.push(quality)

    // 히스토리 길이 제한
    if (this.qualityHistory.length > this.maxHistoryLength) {
      this.qualityHistory.shift()
    }
  }

  /**
   * 평균 품질 정보 반환
   */
  getAverageQuality(): NetworkQualityInfo | null {
    if (this.qualityHistory.length === 0) return null

    const recent = this.qualityHistory.slice(-5) // 최근 5개 샘플

    const avgQuality: NetworkQualityInfo = {
      level: Math.round(
        recent.reduce((sum, q) => sum + q.level, 0) / recent.length,
      ),
      latency: Math.round(
        recent.reduce((sum, q) => sum + q.latency, 0) / recent.length,
      ),
      jitter: Math.round(
        recent.reduce((sum, q) => sum + q.jitter, 0) / recent.length,
      ),
      packetLoss:
        Math.round(
          (recent.reduce((sum, q) => sum + q.packetLoss, 0) /
            recent.length) *
            100,
        ) / 100,
      bandwidth: {
        upload: Math.round(
          recent.reduce((sum, q) => sum + q.bandwidth.upload, 0) /
            recent.length,
        ),
        download: Math.round(
          recent.reduce((sum, q) => sum + q.bandwidth.download, 0) /
            recent.length,
        ),
      },
      timestamp: new Date(),
    }

    return avgQuality
  }

  /**
   * 품질 레벨을 텍스트로 변환
   */
  static getQualityText(level: number): string {
    switch (level) {
      case 5:
        return '최고'
      case 4:
        return '좋음'
      case 3:
        return '보통'
      case 2:
        return '나쁨'
      case 1:
        return '매우 나쁨'
      default:
        return '알 수 없음'
    }
  }
}

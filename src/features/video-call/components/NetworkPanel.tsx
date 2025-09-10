'use client'

import React, { useEffect } from 'react'

import {
  useNetworkQuality,
  useNetworkMonitoring,
  useVideoCallActions,
} from '../store'

export default function NetworkPanel() {
  const quality = useNetworkQuality()
  const monitoring = useNetworkMonitoring()
  const { startMonitoring, stopMonitoring } = useVideoCallActions()

  useEffect(() => {
    // 패널이 활성화되면 네트워크 모니터링 시작
    if (!monitoring) {
      startMonitoring()
    }

    // 컴포넌트 언마운트시 모니터링 중지
    return () => {
      stopMonitoring()
    }
  }, [monitoring, startMonitoring, stopMonitoring])

  const getQualityLevel = () => {
    if (!quality) return 'unknown'

    if (quality.level >= 4) return 'excellent'
    if (quality.level >= 3) return 'good'
    if (quality.level >= 2) return 'fair'
    return 'poor'
  }

  const getQualityColor = () => {
    const level = getQualityLevel()

    switch (level) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-[var(--color-label-subtle)]'
    }
  }

  const getQualityLabel = () => {
    const level = getQualityLevel()

    switch (level) {
      case 'excellent':
        return '매우 좋음'
      case 'good':
        return '좋음'
      case 'fair':
        return '보통'
      case 'poor':
        return '나쁨'
      default:
        return '측정 중...'
    }
  }

  const getQualityBars = () => {
    if (!quality) return []

    const bars = []
    for (let i = 1; i <= 4; i++) {
      bars.push({
        active: i <= quality.level,
        height: `${20 + i * 10}px`,
      })
    }
    return bars
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="border-b border-[var(--color-border-subtle)] p-[var(--spacing-spacing-3xs)]">
        <h3 className="font-label3-semibold text-[var(--color-label-strong)]">
          네트워크 상태
        </h3>
      </div>

      {/* 네트워크 품질 표시 */}
      <div className="p-[var(--spacing-spacing-sm)]">
        {/* 품질 레벨 시각화 */}
        <div className="mb-4 text-center">
          <div className="mb-2 flex items-end justify-center gap-1">
            {getQualityBars().map((bar, index) => (
              <div
                key={index}
                className={`w-3 rounded-t transition-colors ${
                  bar.active
                    ? 'bg-[var(--color-fill-primary)]'
                    : 'bg-[var(--color-gray-200)]'
                }`}
                style={{ height: bar.height }}
              />
            ))}
          </div>

          <p className={`font-label3-semibold ${getQualityColor()}`}>
            {getQualityLabel()}
          </p>
        </div>

        {/* 세부 통계 */}
        {quality && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* 지연시간 */}
              <div className="rounded-lg bg-[var(--color-gray-50)] p-3">
                <p className="font-medium text-[var(--color-label-subtle)]">
                  지연시간
                </p>
                <p className="font-label3-semibold text-[var(--color-label-strong)]">
                  {quality.latency}ms
                </p>
              </div>

              {/* 지터 */}
              <div className="rounded-lg bg-[var(--color-gray-50)] p-3">
                <p className="font-medium text-[var(--color-label-subtle)]">
                  지터
                </p>
                <p className="font-label3-semibold text-[var(--color-label-strong)]">
                  {quality.jitter}ms
                </p>
              </div>

              {/* 패킷 손실 */}
              <div className="rounded-lg bg-[var(--color-gray-50)] p-3">
                <p className="font-medium text-[var(--color-label-subtle)]">
                  패킷 손실
                </p>
                <p className="font-label3-semibold text-[var(--color-label-strong)]">
                  {(quality.packetLoss * 100).toFixed(1)}%
                </p>
              </div>

              {/* 품질 점수 */}
              <div className="rounded-lg bg-[var(--color-gray-50)] p-3">
                <p className="font-medium text-[var(--color-label-subtle)]">
                  품질 점수
                </p>
                <p className="font-label3-semibold text-[var(--color-label-strong)]">
                  {quality.level}/4
                </p>
              </div>
            </div>

            {/* 대역폭 정보 */}
            <div className="rounded-lg bg-[var(--color-gray-50)] p-3">
              <p className="mb-2 font-medium text-[var(--color-label-subtle)]">
                대역폭
              </p>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-[var(--color-label-subtle)]">
                    업로드
                  </p>
                  <p className="font-medium text-[var(--color-label-strong)]">
                    {quality.bandwidth.upload} kbps
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--color-label-subtle)]">
                    다운로드
                  </p>
                  <p className="font-medium text-[var(--color-label-strong)]">
                    {quality.bandwidth.download} kbps
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 권장사항 */}
        {quality && quality.level <= 2 && (
          <div className="mt-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  네트워크 상태 주의
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <ul className="list-inside list-disc space-y-1">
                    {quality.latency > 150 && (
                      <li>
                        지연시간이 높습니다. 네트워크 연결을
                        확인해주세요.
                      </li>
                    )}
                    {quality.packetLoss > 0.02 && (
                      <li>패킷 손실이 발생하고 있습니다.</li>
                    )}
                    {quality.bandwidth.upload < 500 && (
                      <li>업로드 대역폭이 부족합니다.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 모니터링 상태 표시 */}
      <div className="mt-auto border-t border-[var(--color-border-subtle)] p-[var(--spacing-spacing-3xs)]">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                monitoring
                  ? 'animate-pulse bg-green-500'
                  : 'bg-[var(--color-gray-300)]'
              }`}
            />
            <span className="text-[var(--color-label-subtle)]">
              {monitoring ? '실시간 모니터링' : '모니터링 중지됨'}
            </span>
          </div>

          {quality && (
            <span className="text-xs text-[var(--color-label-subtle)]">
              마지막 업데이트: 방금 전
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

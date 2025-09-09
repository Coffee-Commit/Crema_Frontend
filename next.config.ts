import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // OpenVidu v2 라이브러리 SSR 대응
  transpilePackages: ['openvidu-browser'],

  // 실험적 기능 (필요시)
  experimental: {
    esmExternals: 'loose',
  },

  // Webpack 설정 (클라이언트 전용 모듈 처리)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트에서만 OpenVidu 라이브러리 사용
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    } else {
      // 서버에서 OpenVidu 관련 모듈 제외
      config.externals = [
        ...(config.externals || []),
        'openvidu-browser',
      ]
    }

    return config
  },
}

export default nextConfig

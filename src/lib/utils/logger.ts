/**
 * 개발환경에서만 로그를 출력하는 유틸리티
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },

  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  group: (label: string) => {
    if (isDevelopment) {
      console.group(label)
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd()
    }
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },
}

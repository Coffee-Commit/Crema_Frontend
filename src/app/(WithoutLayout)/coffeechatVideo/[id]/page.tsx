// src/app/(WithoutLayout)/coffeechatVideo/[id]/page.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useOpenVidu } from '@/lib/openvidu/useOpenVidu'
import { useAuthStore } from '@/store/useAuthStore'

type ChatMessage = {
  id: string
  who: 'me' | 'other'
  name: string
  time: string
  text: string
}

type SharedFile = {
  id: string
  name: string
  sizeBytes: number
  content: string
  mime: string
}

function pad(n: number) {
  return n.toString().padStart(2, '0')
}
function formatHMS(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`
}
function prettySize(bytes: number) {
  if (bytes >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${bytes} B`
}
function timeLabelKR(d = new Date()) {
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${hh}:${pad(m)}`
}

export default function CoffeeChatVideoPage() {
  // 라우팅/닉네임/마운트
  const params = useParams()
  const search = useSearchParams()
  const id =
    (Array.isArray(params?.id) ? params?.id[0] : params?.id) ??
    'preview'

  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const myNickname = useMemo(() => user?.nickname ?? '나', [user])
  const rawPeerNickname = useMemo(
    () => search?.get('peer') ?? '게스트',
    [search],
  )

  // 타이머
  const startAt = useMemo(() => {
    const s = search?.get('start')
    const d = s ? new Date(s) : new Date()
    return isNaN(d.getTime()) ? new Date() : d
  }, [search])

  const endAt = useMemo<Date | null>(() => {
    const endIso = search?.get('end')
    const endInMin = search?.get('endIn')
    if (endIso) {
      const d = new Date(endIso)
      return isNaN(d.getTime()) ? null : d
    }
    if (endInMin && !Number.isNaN(Number(endInMin))) {
      const d = new Date()
      d.setMinutes(d.getMinutes() + Number(endInMin))
      return d
    }
    return null
  }, [search])

  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const elapsedSec = Math.max(
    0,
    Math.floor((now.getTime() - startAt.getTime()) / 1000),
  )
  const remainingSec = endAt
    ? Math.max(
        0,
        Math.floor((endAt.getTime() - now.getTime()) / 1000),
      )
    : null
  const isSessionEnded = endAt ? now >= endAt : false

  // OV(목)
  const {
    connected,
    join,
    leave,
    micOn,
    camOn,
    toggleMic,
    toggleCam,
    screenShareActive,
    startScreenShare,
    stopScreenShare,
    screenShareStream,
  } = useOpenVidu()

  useEffect(() => {
    join({ sessionId: id, token: 'MOCK_TOKEN' })
    return () => leave()
  }, [id, join, leave])

  useEffect(() => {
    if (!endAt) return
    if (now >= endAt && connected) leave()
  }, [now, endAt, connected, leave])

  // ====== 내 카메라 스트림 (실제 카메라) ======
  const myCamVideoRef = useRef<HTMLVideoElement>(null)
  const [myCamStream, setMyCamStream] = useState<MediaStream | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false

    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // 내 타일에선 오디오 재생 안 함(에코 방지)
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        setMyCamStream(stream)
        const el = myCamVideoRef.current
        if (el) {
          el.muted = true
          el.playsInline = true
          el.srcObject = stream
          try {
            await el.play()
          } catch {
            // autoplay 차단 등은 무시
          }
        }
      } catch (err) {
        console.error('getUserMedia 실패:', err)
        setMyCamStream(null)
      }
    }

    // 켜야 하는 조건: 연결됨 & 캠ON & 화면공유OFF & 세션 유효
    if (connected && camOn && !screenShareActive && !isSessionEnded) {
      void enableCamera()
    } else {
      // 조건 해제 시 정리
      setMyCamStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop())
        return null
      })
      const el = myCamVideoRef.current
      if (el) el.srcObject = null
    }

    return () => {
      cancelled = true
      setMyCamStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop())
        return null
      })
      const el = myCamVideoRef.current
      if (el) el.srcObject = null
    }
  }, [connected, camOn, screenShareActive, isSessionEnded])

  // ====== 화면공유 비디오 연결 ======
  const shareVideoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = shareVideoRef.current
    if (!el) return
    if (screenShareActive && screenShareStream) {
      el.muted = true
      el.playsInline = true
      el.srcObject = screenShareStream
      el.play?.().catch(() => {})
    } else {
      el.srcObject = null
    }
  }, [screenShareActive, screenShareStream])

  // 화면공유 버튼
  const handleScreenShare = async () => {
    if (isSessionEnded) return
    if (screenShareActive) await stopScreenShare()
    else await startScreenShare()
  }

  // 채팅(동일)
  const [tab, setTab] = useState<'chat' | 'files'>('chat')
  const [chatList, setChatList] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [chatList, tab])

  const handleSend = () => {
    if (isSessionEnded) return
    const text = input.trim()
    if (!text) return
    setChatList((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        who: 'me',
        name: myNickname,
        time: timeLabelKR(new Date()),
        text,
      },
    ])
    setInput('')
  }

  // 공유자료(동일)
  const sharedFiles: SharedFile[] = useMemo(
    () => [
      {
        id: 'f1',
        name: '사전공유_파일명.pdf',
        sizeBytes: 1.01 * 1024 * 1024,
        content:
          '데모 PDF(텍스트). 실제 환경에서는 서버 파일을 blob으로 미리보기/다운로드하세요.',
        mime: 'application/pdf',
      },
      {
        id: 'f2',
        name: '사전공유_자료.txt',
        sizeBytes: 23_456,
        content:
          '두 번째 데모 텍스트 파일입니다. 프리뷰 모달에서 내용을 확인할 수 있어요.',
        mime: 'text/plain',
      },
    ],
    [],
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')
  const [previewMime, setPreviewMime] =
    useState<string>('application/pdf')
  const openPreview = (file: SharedFile) => {
    const blob = new Blob([file.content], { type: file.mime })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    setPreviewName(file.name)
    setPreviewMime(file.mime)
  }
  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewName('')
  }
  const handleDownload = (file: SharedFile) => {
    const blob = new Blob([file.content], { type: file.mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      {/* 헤더 */}
      <header className="flex h-[60px] items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <span className="font-title3 text-label-strong">
            CremaChat
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#EB5F27] px-2 py-[2px] text-xs text-white">
            <Image
              src="/icons/videoChat/call.svg"
              alt="timer"
              width={14}
              height={14}
            />
            {formatHMS(elapsedSec)}
          </span>
          {endAt && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-[2px] text-xs text-gray-700">
              종료까지 {formatHMS(remainingSec ?? 0)}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">방 ID: {id}</span>
        <div
          className={`rounded-md px-2 py-1 text-xs ${
            connected && !isSessionEnded
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isSessionEnded
            ? '종료됨'
            : connected
              ? '연결됨'
              : '목모드'}
        </div>
      </header>

      {/* 본문 */}
      <div className="relative flex flex-1 flex-row">
        {/* 비디오 영역 */}
        <div className="relative flex flex-1 flex-row gap-4 p-4">
          {/* 화면공유 ON → 좌측 타일 하나가 전체를 차지하고 그 안에 공유화면 렌더 */}
          {connected && !isSessionEnded && screenShareActive ? (
            <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-black">
              <video
                ref={shareVideoRef}
                className="h-full w-full object-contain"
                muted
                playsInline
                autoPlay
              />
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-[2px] text-[12px] text-white">
                <span suppressHydrationWarning>
                  {mounted ? `${myNickname} (화면공유)` : ''}
                </span>
              </div>
            </div>
          ) : (
            // 화면공유 OFF → 좌/우 2타일(내 캠 / 상대) — 내 타일은 실제 카메라 표시
            <>
              {/* 내 카메라 타일 */}
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                <video
                  ref={myCamVideoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                {/* 카메라 미표시 상황엔 플레이스홀더 문구 */}
                {!connected || !camOn || !myCamStream ? (
                  <div className="text-label-subtle absolute inset-0 grid place-items-center">
                    {connected && !isSessionEnded
                      ? '내 화면(카메라 대기)'
                      : '대기'}
                  </div>
                ) : null}
                <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                  {!micOn && (
                    <Image
                      src="/icons/videoChat/micOff.svg"
                      alt="mic-off"
                      width={14}
                      height={14}
                      className="mr-1 inline-block"
                    />
                  )}
                  <span suppressHydrationWarning>
                    {mounted ? myNickname : ''}
                  </span>
                </div>
              </div>

              {/* 상대 타일(목) */}
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                <div className="text-label-subtle">상대 화면(목)</div>
                <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                  <span suppressHydrationWarning>
                    {mounted ? rawPeerNickname : ''}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 우측 패널 (채팅/자료) */}
        <aside className="flex w-[360px] flex-col border-l">
          <div className="flex items-center gap-6 px-4 pt-3">
            <button
              className={`font-label3-semibold pb-3 ${
                tab === 'chat'
                  ? 'text-label-strong border-b-2 border-[#EB5F27]'
                  : 'text-label-default'
              }`}
              onClick={() => setTab('chat')}
            >
              채팅
            </button>
            <button
              className={`font-label3-semibold pb-3 ${
                tab === 'files'
                  ? 'text-label-strong border-b-2 border-[#EB5F27]'
                  : 'text-label-default'
              }`}
              onClick={() => setTab('files')}
            >
              공유된 자료
            </button>
          </div>

          <div className="flex flex-1 flex-col px-4 pb-4">
            {tab === 'chat' ? (
              <>
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto rounded-md bg-white"
                >
                  <ul className="flex flex-col gap-3 py-3">
                    {chatList.map((m) => {
                      const isMe = m.who === 'me'
                      return (
                        <li
                          key={m.id}
                          className={`flex items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <span className="mr-2 inline-block h-6 w-6 shrink-0 rounded-full bg-gray-200" />
                          )}
                          <div
                            className={`max-w-[70%] ${isMe ? 'text-right' : 'text-left'}`}
                          >
                            <div className="mb-[2px] text-[12px] text-gray-500">
                              {!isMe && (
                                <span className="mr-1">{m.name}</span>
                              )}
                              <span>{m.time}</span>
                            </div>
                            <div
                              className={`rounded-md px-3 py-2 text-[13px] ${
                                isMe
                                  ? 'bg-[#EB5F27] text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={input}
                    disabled={isSessionEnded}
                    onChange={(e) => setInput(e.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={(e) => {
                      const native = e.nativeEvent as unknown as {
                        isComposing?: boolean
                      }
                      const nativeComposing =
                        native.isComposing ?? false
                      if (
                        e.key === 'Enter' &&
                        !isComposing &&
                        !nativeComposing
                      ) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder={
                      isSessionEnded
                        ? '세션이 종료되었습니다.'
                        : '메시지를 입력하세요...'
                    }
                    className="h-[36px] flex-1 rounded-md border px-3 text-[13px] outline-none placeholder:text-gray-400 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    disabled={isSessionEnded}
                    onClick={handleSend}
                    className="h-[36px] rounded-md bg-[#EB5F27] px-3 text-[13px] text-white disabled:opacity-50"
                  >
                    전송
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto py-3">
                <h3 className="font-label3-semibold mb-2">
                  사전 메시지 & 자료
                </h3>
                <div className="space-y-2">
                  {sharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => openPreview(file)}
                        className="flex flex-1 items-center gap-2 text-left"
                        title="미리보기"
                      >
                        <Image
                          src="/icons/file-pdf.svg"
                          alt="pdf"
                          width={20}
                          height={20}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {prettySize(file.sizeBytes)}
                          </span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="ml-2 rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        다운로드
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {isSessionEnded && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/60">
            <div className="pointer-events-auto rounded-md border bg-white px-4 py-3 text-sm shadow">
              세션이 종료되었습니다.
            </div>
          </div>
        )}
      </div>

      {/* 하단 컨트롤 */}
      <footer className="flex items-center justify-center gap-4 border-t bg-gray-50 p-4">
        <button
          className={`rounded-full p-3 ${micOn ? 'bg-gray-100' : 'bg-red-100'} disabled:opacity-50`}
          title="마이크"
          disabled={isSessionEnded}
          onClick={() => toggleMic()}
        >
          <Image
            src="/icons/videoChat/mic.svg"
            alt="mic"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${camOn ? 'bg-gray-100' : 'bg-red-100'} disabled:opacity-50`}
          title="비디오"
          disabled={isSessionEnded}
          onClick={() => toggleCam()}
        >
          <Image
            src="/icons/videoChat/video.svg"
            alt="video"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${screenShareActive ? 'bg-orange-100' : 'bg-gray-100'} disabled:opacity-50`}
          title="화면 공유"
          disabled={isSessionEnded}
          onClick={handleScreenShare}
        >
          <Image
            src="/icons/videoChat/screenShare.svg"
            alt="screen share"
            width={20}
            height={20}
          />
        </button>
        <button
          onClick={() => leave()}
          disabled={!connected}
          className="rounded-full bg-red-500 p-3 text-white disabled:opacity-60"
          title="통화 종료"
        >
          <Image
            src="/icons/videoChat/call.svg"
            alt="end call"
            width={20}
            height={20}
          />
        </button>
      </footer>

      {/* 미리보기 모달 */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40"
          onClick={closePreview}
        >
          <div
            className="relative h-[80vh] w-[80vw] max-w-[960px] rounded-md bg-white shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-semibold">
                {previewName}
              </span>
              <button
                onClick={closePreview}
                className="rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(80vh-42px)] w-full">
              {previewMime.startsWith('application/pdf') ? (
                <iframe
                  src={previewUrl}
                  title="preview"
                  className="h-full w-full"
                />
              ) : (
                <object
                  data={previewUrl}
                  className="h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

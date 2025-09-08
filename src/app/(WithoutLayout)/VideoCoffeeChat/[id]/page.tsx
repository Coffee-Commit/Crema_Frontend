'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/store/useAuthStore'

/* ===================== Utils / Types ===================== */
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

/* ===================== Page ===================== */
export default function VideoCoffeeChatPage() {
  /* ------ routing ------ */
  const params = useParams()
  const search = useSearchParams()
  const rawId = params?.id as string | string[] | undefined
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? 'preview')

  /* ------ nicknames ------ */
  const { user } = useAuthStore()
  const myNickname = useMemo(() => user?.nickname ?? '나', [user])
  const peerNickname = useMemo(
    () => search?.get('peer') ?? '게스트',
    [search],
  )

  /* ------ timers ------ */
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

  /* ------ camera (내) ------ */
  const myCamVideoRef = useRef<HTMLVideoElement>(null)
  const [myCamStream, setMyCamStream] = useState<MediaStream | null>(
    null,
  )
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
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
          await el.play().catch(() => {})
        }
      } catch {
        setMyCamStream(null)
      }
    }
    if (camOn) void enableCamera()
    else {
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
  }, [camOn])

  /* ------ screen share (내) ------ */
  const [shareOn, setShareOn] = useState(false)
  const [shareStream, setShareStream] = useState<MediaStream | null>(
    null,
  )
  const myShareVideoRef = useRef<HTMLVideoElement>(null)

  // 화면공유 시작/정지
  const toggleShare = async () => {
    if (shareOn) {
      shareStream?.getTracks().forEach((t) => t.stop())
      setShareStream(null)
      setShareOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })
      setShareStream(stream)
      setShareOn(true)
      // 브라우저 UI에서 중지 클릭 시
      const track = stream.getVideoTracks()[0]
      track?.addEventListener('ended', () => {
        setShareOn(false)
        setShareStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop())
          return null
        })
      })
    } catch {
      setShareOn(false)
      setShareStream(null)
    }
  }

  // 화면공유 비디오 연결
  useEffect(() => {
    const el = myShareVideoRef.current
    if (!el) return
    if (shareOn && shareStream) {
      el.muted = true
      el.playsInline = true
      el.srcObject = shareStream
      el.play().catch(() => {})
    } else {
      el.srcObject = null
    }
  }, [shareOn, shareStream])

  /* ------ tabs / chat ------ */
  const [tab, setTab] = useState<'chat' | 'files'>('chat')

  // 초기 채팅 샘플 2개(스샷 모양)
  const [chatList, setChatList] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      who: 'other',
      name: peerNickname,
      time: '오전 2:23',
      text: '잘 들립니다!',
    },
    {
      id: 'init-2',
      who: 'me',
      name: myNickname,
      time: '오전 2:24',
      text: '좋습니다!',
    },
  ])
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

  /* ------ shared files (card UI) ------ */
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
        name: '사전공유_파일명.pdf',
        sizeBytes: 1.01 * 1024 * 1024,
        content: '두 번째 데모 텍스트 파일입니다.',
        mime: 'application/pdf',
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

  /* ===================== Render ===================== */
  return (
    <div className="bg-fill-footer-gray flex h-dvh min-h-screen w-full flex-col">
      {/* 헤더 */}
      <header className="flex h-[60px] items-center justify-between px-4">
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
        <div className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
          연결됨(목)
        </div>
      </header>

      {/* 본문 2열 - 전체 높이 채우기 */}
      <div className="relative flex flex-1 flex-row overflow-hidden">
        {/* 비디오 영역 */}
        <div className="flex flex-1 flex-row gap-4 p-4">
          {/* 화면공유가 켜져 있으면 공유화면이 전체를 차지 */}
          {shareOn ? (
            <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-black">
              <video
                ref={myShareVideoRef}
                className="h-full w-full object-contain"
                muted
                playsInline
                autoPlay
              />
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-[2px] text-[12px] text-white">
                {myNickname} (화면공유)
              </div>
            </div>
          ) : (
            <>
              {/* 내 화면 */}
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                <video
                  ref={myCamVideoRef}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                {!myCamStream && (
                  <div className="text-label-subtle absolute inset-0 grid place-items-center">
                    내 화면(목)
                  </div>
                )}
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
                  {myNickname}
                </div>
              </div>

              {/* 상대 화면(플레이스홀더) */}
              <div className="relative grid flex-1 place-items-center overflow-hidden rounded-md bg-gray-300">
                <div className="text-label-subtle">상대 화면(목)</div>
                <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-[2px] text-[12px] text-white">
                  {peerNickname}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 우측 패널 (스크롤은 이 영역 내부에서만) */}
        <aside className="flex w-[476px] min-w-[360px] max-w-[520px] flex-col">
          {/* 탭 헤더 */}
          <div className="px-spacing-3xs pt-spacing-3xs flex w-full items-center">
            <div className="flex w-full items-center">
              <button
                className={`relative w-1/2 pb-3 text-[18px] font-semibold ${
                  tab === 'chat' ? 'text-[#222]' : 'text-[#9CA3AF]'
                }`}
                onClick={() => setTab('chat')}
              >
                <span className="mr-2">채팅</span>
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EB5F27] px-2 text-[11px] leading-none text-white">
                  {chatList.length}
                </span>
                {tab === 'chat' && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded bg-[#EB5F27]" />
                )}
              </button>
              <button
                className={`relative w-1/2 pb-3 text-[18px] font-semibold ${
                  tab === 'files' ? 'text-[#222]' : 'text-[#9CA3AF]'
                }`}
                onClick={() => setTab('files')}
              >
                공유된 자료
                {tab === 'files' && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded bg-[#EB5F27]" />
                )}
              </button>
            </div>
          </div>

          {/* 컨텐츠 스크롤 컨테이너 */}
          <div className="flex min-h-0 flex-1 flex-col p-4">
            {tab === 'chat' ? (
              // ===== 채팅 카드: 내부만 스크롤 =====
              <div className="flex min-h-0 flex-1 flex-col rounded-[8px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                {/* 메시지 리스트 영역 */}
                <div
                  ref={chatScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto rounded-[8px]"
                >
                  <ul className="space-y-6">
                    {chatList.map((m) => (
                      <li
                        key={m.id}
                        className="flex gap-3"
                      >
                        <span className="mt-[2px] inline-block h-8 w-8 shrink-0 rounded-full bg-gray-300" />
                        <div className="flex flex-col">
                          <div className="mb-1 text-[12px] text-[#9CA3AF]">
                            <span className="mr-2 text-[#6B7280]">
                              {m.name}
                            </span>
                            <span>{m.time}</span>
                          </div>
                          <div className="text-[14px] font-semibold text-[#111827]">
                            {m.text}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 입력 박스 (하단 고정) */}
                <div className="mt-4 flex items-center justify-end gap-3">
                  <input
                    value={input}
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
                    placeholder="메시지를 입력하세요..."
                    className="h-[44px] w-full rounded-[8px] border border-[#E5E7EB] px-4 text-[14px] outline-none placeholder:text-[#9CA3AF] focus:border-[#EB5F27]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="h-[44px] w-[80px] rounded-[8px] bg-[#EB5F27] px-5 text-[14px] font-semibold text-white hover:brightness-95"
                  >
                    전송
                  </button>
                </div>
              </div>
            ) : (
              // ===== 공유된 자료: 내부 스크롤 =====
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                {/* 후배 정보 */}
                <section className="mb-4 rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    후배 정보
                  </h3>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-gray-500">이름(닉네임)</dt>
                    <dd className="text-gray-900">{peerNickname}</dd>
                    <dt className="text-gray-500">커피챗 분야</dt>
                    <dd className="text-gray-900">디자인</dd>
                    <dt className="text-gray-500">커피챗 주제</dt>
                    <dd className="text-gray-900">포트폴리오</dd>
                    <dt className="text-gray-500">자기소개</dt>
                    <dd className="text-gray-900">
                      안녕하세요! UX/UI를 준비하고 있는 학생입니다.
                    </dd>
                  </dl>
                </section>

                {/* 사전 메시지 & 자료 */}
                <section className="mb-4 rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    사전 메시지 & 자료
                  </h3>
                  <div className="text-sm leading-relaxed text-gray-800">
                    <p className="mb-2 font-medium text-gray-700">
                      ‘{peerNickname}’ 님이 작성한 메시지입니다.
                    </p>
                    <p>
                      안녕하세요, 선배님. 포트폴리오 방향성에 대해
                      조언을 듣고 싶어 메시지 드립니다. 프로젝트
                      리뷰에서 강조할 포인트와 면접 대비 팁이
                      궁금합니다. 감사합니다!
                    </p>
                  </div>
                </section>

                {/* 공유 파일 리스트 */}
                <section className="rounded-md border bg-white p-4 shadow-sm">
                  <h3 className="font-label3-semibold text-label-strong mb-3">
                    ‘{peerNickname}’ 님이 공유한 자료입니다.
                  </h3>
                  <ul className="space-y-2">
                    {sharedFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
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
                            <span className="text-sm font-medium text-gray-900">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {prettySize(file.sizeBytes)}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="ml-2 rounded-md border px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                        >
                          다운로드
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 하단 컨트롤 */}
      <footer className="flex items-center justify-center gap-4 p-4">
        <button
          className={`rounded-full p-3 ${micOn ? 'bg-gray-100' : 'bg-red-100'}`}
          title="마이크"
          onClick={() => setMicOn((v) => !v)}
        >
          <Image
            src="/icons/videoChat/mic.svg"
            alt="mic"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${camOn ? 'bg-gray-100' : 'bg-red-100'}`}
          title="비디오"
          onClick={() => setCamOn((v) => !v)}
        >
          <Image
            src="/icons/videoChat/video.svg"
            alt="video"
            width={20}
            height={20}
          />
        </button>
        <button
          className={`rounded-full p-3 ${shareOn ? 'bg-orange-100' : 'bg-gray-100'}`}
          title="화면 공유"
          onClick={toggleShare}
        >
          <Image
            src="/icons/videoChat/screenShare.svg"
            alt="screen share"
            width={20}
            height={20}
          />
        </button>
        <button
          className="rounded-full bg-red-500 p-3 text-white"
          title="통화 종료"
          onClick={() => {
            setCamOn(false)
            setShareOn(false)
            setMyCamStream((prev) => {
              prev?.getTracks().forEach((t) => t.stop())
              return null
            })
            setShareStream((prev) => {
              prev?.getTracks().forEach((t) => t.stop())
              return null
            })
          }}
        >
          <Image
            src="/icons/videoChat/call.svg"
            alt="end call"
            width={20}
            height={20}
          />
        </button>
      </footer>

      {/* 파일 미리보기 모달 */}
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

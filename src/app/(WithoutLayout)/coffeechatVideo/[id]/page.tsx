'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useOpenVidu } from '@/lib/openvidu/useOpenVidu'

export default function CoffeeChatVideoPage() {
  const params = useParams()
  const rawId = params?.id as string | string[] | undefined
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? 'preview')

  const { connected, leave } = useOpenVidu()

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      {/* 헤더 */}
      <header className="flex h-[60px] items-center justify-between border-b px-4">
        <span className="font-title3 text-label-strong">
          CremaChat
        </span>
        <span className="text-sm text-gray-500">방 ID: {id}</span>
        <div className="rounded-md bg-black/50 px-2 py-1 text-xs text-white">
          {connected ? '연결됨' : '목모드 (연결 안 함)'}
        </div>
      </header>

      {/* 본문 */}
      <div className="flex flex-1 flex-row">
        {/* 비디오 영역 */}
        <div className="flex flex-1 flex-row gap-4 p-4">
          <div className="relative grid flex-1 place-items-center rounded-md bg-gray-200">
            <div className="text-label-subtle">내 화면 (미연결)</div>
          </div>
          <div className="relative grid flex-1 place-items-center rounded-md bg-gray-200">
            <div className="text-label-subtle">
              상대 화면 (미연결)
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <aside className="flex w-[360px] flex-col border-l p-4">
          <div className="mb-4 flex border-b pb-2">
            <button className="font-label3-semibold text-label-strong mr-4">
              채팅{' '}
              <span className="ml-1 rounded bg-red-500 px-1 text-white">
                12
              </span>
            </button>
            <button className="font-label3-semibold text-label-strong border-b-2 border-orange-500">
              공유된 자료
            </button>
          </div>

          <section className="flex flex-col gap-4 overflow-y-auto">
            <div className="rounded-md border p-3">
              <h3 className="font-label3-semibold mb-2">후배 정보</h3>
              <p>이름(닉네임): 닉네임</p>
              <p>커피챗 분야: 디자인</p>
              <p>커피챗 주제: 포트폴리오</p>
              <p className="text-sm text-gray-500">
                안녕하세요! 후배 플레이어예요
              </p>
            </div>

            <div className="rounded-md border p-3">
              <h3 className="font-label3-semibold mb-2">
                사전 메시지 & 자료
              </h3>
              <p className="mb-3 text-sm">
                안녕하세요, 선배님! 저는 UX/UI 디자이너로 취업을
                준비하고 있는 23살 학생입니다…
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <span className="rounded bg-red-500 px-2 py-1 text-white">
                    PDF
                  </span>
                  사전공유_파일명.pdf (1.01MB)
                </div>
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <span className="rounded bg-red-500 px-2 py-1 text-white">
                    PDF
                  </span>
                  사전공유_파일명.pdf (1.01MB)
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* 하단 컨트롤 바 */}
      <footer className="flex items-center justify-center gap-4 border-t bg-gray-50 p-4">
        <button
          disabled
          className="rounded bg-gray-200 px-4 py-2 opacity-60"
          title="연결 후 사용 가능"
        >
          <Image
            src="/icons/videoChat/mic.svg"
            alt="마이크"
            width={20}
            height={20}
          />
        </button>

        <button
          disabled
          className="rounded bg-gray-200 px-4 py-2 opacity-60"
          title="연결 후 사용 가능"
        >
          <Image
            src="/icons/videoChat/video.svg"
            alt="비디오"
            width={20}
            height={20}
          />
        </button>

        <button
          disabled
          className="rounded bg-gray-200 px-4 py-2 opacity-60"
          title="연결 후 사용 가능"
        >
          <Image
            src="/icons/videoChat/screenShare.svg"
            alt="화면공유"
            width={20}
            height={20}
          />
        </button>

        <button
          onClick={() => {
            if (connected) leave()
          }}
          disabled={!connected}
          className="rounded px-4 py-2 text-white disabled:opacity-60"
          style={{
            backgroundColor: connected ? '#ef4444' : '#fca5a5',
          }}
          title="연결 후 사용 가능"
        >
          <Image
            src="/icons/videoChat/call.svg"
            alt="통화 종료"
            width={20}
            height={20}
          />
        </button>
      </footer>
    </div>
  )
}

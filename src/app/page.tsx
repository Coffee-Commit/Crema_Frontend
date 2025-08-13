export default function Home() {
  return (
    <main className="min-h-dvh bg-gray-100 p-8">
      <div className="mx-auto max-w-lg space-y-6 rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-brand-500 text-3xl font-bold">
          Tailwind v4 적용 확인 🎉
        </h1>

        <p className="text-gray-600">
          이 텍스트 색상, 크기, 간격이 Tailwind에서 잘 먹히면 설치
          성공입니다.
        </p>

        <div className="flex gap-4">
          <button className="btn bg-blue-500 text-white hover:bg-blue-600">
            기본 버튼
          </button>
          <button className="btn btn-brand hover:opacity-80">
            브랜드 버튼
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 rounded-lg bg-red-300" />
          <div className="h-20 rounded-lg bg-green-300" />
          <div className="h-20 rounded-lg bg-blue-300" />
          <div className="h-20 rounded-lg bg-yellow-300" />
        </div>

        <p className="text-sm text-gray-500 md:text-lg">
          화면 크기를 줄였다 키우면 반응형 폰트 크기가 바뀌어야
          합니다.
        </p>
      </div>
    </main>
  )
}

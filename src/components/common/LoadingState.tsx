'use client'

export default function Loading() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-left">
      <div className="gap-spacing-6xl md:gap-spacing-2xl flex flex-col items-start md:flex-row">
        <div className="gap-spacing-xl flex flex-col items-center md:items-start">
          <div className="gap-spacing-2xl flex flex-col items-center md:items-start">
            <h1 className="text-label-primary text-[80px] font-extralight">
              Loading
            </h1>
            {/* 도넛 스피너 */}
            <div className="mt-6">
              <div className="border-border-light h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-transparent" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

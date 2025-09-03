import MypageSidebar from './_components/SideBars/MypageSidebar'

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <section className="bg-fill-banner-yellow">
        <div className="container mx-auto h-[180px]" />
      </section>
      <section className="px-container-padding-sm py-spacing-6xl lg:px-container-padding-lg container mx-auto flex gap-[108px]">
        <div className="relative z-10 -mt-[130px]">
          <MypageSidebar />
        </div>
        <div className="gap-spacing-6xl mr-[84px] flex flex-1 flex-col">
          {children}
        </div>
      </section>
    </>
  )
}

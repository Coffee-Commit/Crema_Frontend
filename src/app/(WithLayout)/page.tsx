'use client'

export default function Page() {
  return (
    <>
      <section className="gap-gutter grid grid-cols-12">
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-red-200">
          박스1
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-blue-200">
          박스2
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-green-200">
          박스3
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-yellow-200">
          박스4
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-red-200">
          박스5
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-blue-200">
          박스6
        </div>
        <div className="col-span-3 flex flex-col flex-wrap gap-4 bg-green-200">
          박스7
        </div>
      </section>
    </>
  )
}

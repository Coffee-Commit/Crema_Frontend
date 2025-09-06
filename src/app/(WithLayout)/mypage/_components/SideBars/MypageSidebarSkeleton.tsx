import React from 'react'

const MypageSidebarSkeleton = () => {
  return (
    <aside className="border-border-subtler bg-fill-white p-spacing-xs gap-spacing-md flex h-[1000px] w-[300px] flex-col rounded-sm border">
      {/* 프로필 영역 (스켈레톤) */}
      <div className="gap-spacing-md flex w-full flex-col">
        <div className="gap-spacing-3xs flex flex-row items-center">
          <div className="bg-fill-disabled h-[72px] w-[72px] animate-pulse rounded-full" />
          <div className="gap-spacing-3xs ml-spacing-3xs flex flex-col">
            <div className="bg-fill-disabled h-4 w-12 animate-pulse rounded-sm" />
            <div className="bg-fill-disabled h-4 w-24 animate-pulse rounded-sm" />
          </div>
        </div>

        <div className="gap-spacing-3xs flex flex-col">
          <div className="gap-spacing-6xs border-border-subtler py-spacing-2xs rounded-2xs flex h-[40px] w-full items-center justify-center border">
            <div className="bg-fill-disabled h-4 w-14 animate-pulse rounded-sm" />
          </div>
          <div className="bg-fill-disabled h-9 w-full animate-pulse rounded-sm" />
        </div>
      </div>

      <div className="border-fill-disabled w-full border-t"></div>

      {/* 네비게이션 (스켈레톤) */}
      <div className="gap-spacing-xl flex w-full flex-col items-start">
        <div className="gap-spacing-xs flex w-full flex-col">
          <div className="bg-fill-disabled h-5 w-24 animate-pulse rounded-sm" />
          <ul className="mt-spacing-3xs gap-spacing-2xs flex flex-col">
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
          </ul>
        </div>
        <div className="gap-spacing-xs flex w-full flex-col">
          <div className="bg-fill-disabled h-5 w-24 animate-pulse rounded-sm" />
          <ul className="mt-spacing-3xs gap-spacing-2xs flex flex-col">
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
            <li className="bg-fill-disabled h-8 w-40 animate-pulse rounded-sm" />
          </ul>
        </div>
      </div>
    </aside>
  )
}

export default MypageSidebarSkeleton

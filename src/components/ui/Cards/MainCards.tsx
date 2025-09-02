'use client'

import clsx from 'clsx'
import Image from 'next/image'

interface FeatureCardProps {
  title: string
  description1: string
  description2: string
  iconSrc: string
  iconWidth?: number
  iconHeight?: number
  className?: string
}

export function FeatureCard({
  title,
  description1,
  description2,
  iconSrc,
  iconWidth = 80,
  iconHeight = 80,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={clsx(
        'bg-fill-selected-orange pt-spacing-md pl-spacing-xs max-x-[336px] flex max-h-[304px] flex-col justify-between rounded-md',
        className,
      )}
    >
      <div className="flex flex-col items-start text-left">
        <h3 className="font-label2 mb-spacing-3xs text-label-deep">
          {title}
        </h3>
        <p className="font-body2 text-label-default">
          {description1}
        </p>
        <p className="font-body2 text-label-default">
          {description2}
        </p>
      </div>

      <div className="flex justify-end">
        <Image
          src={iconSrc}
          alt={title}
          width={iconWidth}
          height={iconHeight}
        />
      </div>
    </div>
  )
}

interface HeroCardProps {
  subtitle1: string
  subtitle2: string
  title: string
  iconSrc: string
  iconWidth?: number
  iconHeight?: number
  className?: string
}

export function HeroCard({
  subtitle1,
  subtitle2,
  title,
  iconSrc,
  iconWidth = 120,
  iconHeight = 120,
  className,
}: HeroCardProps) {
  return (
    <div
      className={clsx(
        'rounded-xs bg-fill-tooltip-orange px-spacing-xs py-spacing-md text-label-white flex flex-col justify-between',
        className,
      )}
    >
      <div className="flex flex-col items-start text-left">
        <p className="font-body2 mb-spacing-6xs text-label-strong">
          {subtitle1}
        </p>
        <p className="font-body2 mb-spacing-4xs text-label-strong">
          {subtitle2}
        </p>
        <h2 className="font-title3 text-label-deep">{title}</h2>
      </div>
      <Image
        src={iconSrc}
        alt={title}
        width={iconWidth}
        height={iconHeight}
      />
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import SquareButton from '@/components/ui/Buttons/SquareButton'
import { useAuthStore } from '@/store/useAuthStore'

export default function UserInfoCard() {
  const { user, tokens, setAuth } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<
    string | null
  >(null)

  const getAuthOptions = (
    method: string,
    body?: BodyInit,
  ): RequestInit => {
    if (user?.provider === 'test' && tokens?.accessToken) {
      return {
        method,
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        body,
      }
    }
    return { method, credentials: 'include', body }
  }

  useEffect(() => {
    if (user) {
      setNickname(user.nickname)
      setEmail(user.email ?? '')
      setBio(user.description ?? '')
      setProfileImageUrl(user.profileImageUrl ?? null)
    }
  }, [user])

  const handleSave = async () => {
    try {
      const body = new URLSearchParams()
      body.append('nickname', nickname)
      body.append('email', email)
      body.append('description', bio)

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me/profile/info`,
        getAuthOptions('PUT', body),
      )
      if (!res.ok) throw new Error('프로필 업데이트 실패')

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/member/me`,
        getAuthOptions('GET'),
      )
      if (meRes.ok) {
        const meData = await meRes.json()
        setAuth({ user: meData.result, tokens: tokens! })
      }

      setIsEditing(false)
    } catch (err) {
      console.error('❌ 저장 실패:', err)
    }
  }

  return (
    <main className="gap-spacing-3xl p-spacing-xs ml-[65px] flex flex-col">
      <section className="py-spacing-md px-spacing-xs gap-spacing-3xl border-border-subtler flex flex-col rounded-sm border">
        <div className="flex items-center justify-between">
          <h1 className="font-heading2 text-label-strong">내 정보</h1>
          <SquareButton
            variant={isEditing ? 'primary' : 'secondary'}
            size="md"
            onClick={() =>
              isEditing ? handleSave() : setIsEditing(true)
            }
          >
            {isEditing ? '저장' : '편집'}
          </SquareButton>
        </div>
        {!isEditing ? (
          <div className="gap-spacing-7xl flex flex-row items-center">
            <div className="flex flex-col items-start justify-center gap-2">
              <Image
                src={profileImageUrl || '/images/profileMypage.png'}
                alt="프로필 이미지"
                width={152}
                height={152}
                className="border-border-subtle rounded-full border object-cover"
              />
            </div>
            <div className="gap-spacing-sm flex w-full flex-col">
              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  닉네임
                </h2>
                <p className="font-body2 text-label-subtle py-spacing-5xs">
                  {nickname || '-'}
                </p>
              </div>

              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  계정 이메일
                </h2>
                <p className="font-body2 text-label-subtle py-spacing-5xs">
                  {email || '-'}
                </p>
              </div>

              <div className="gap-spacing-4xs flex flex-col">
                <h2 className="font-title4 text-label-strong">
                  자기소개
                </h2>
                <p className="font-body2 text-label-subtle py-spacing-5xs">
                  {bio || '-'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 프로필 이미지 편집 */}
            <div className="gap-spacing-7xl flex flex-row items-center">
              <div className="flex flex-col items-start justify-center gap-2">
                <Image
                  src={profileImageUrl || '/images/profileMypage.png'}
                  alt="프로필 이미지"
                  width={152}
                  height={152}
                  className="border-border-subtle rounded-full border object-cover"
                />
              </div>

              <div className="gap-spacing-sm flex w-full flex-col">
                {/* 닉네임 입력 */}
                <div className="gap-spacing-2xs flex flex-col">
                  <label className="font-title4 text-label-strong">
                    닉네임
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      maxLength={10}
                      onChange={(e) => setNickname(e.target.value)}
                      className="border-border-subtle bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:ring-label-primary rounded-2xs w-full border pr-12 focus:outline-none focus:ring-1"
                    />
                    <span className="text-label-subtle absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      {nickname.length}/10
                    </span>
                  </div>
                </div>

                {/* 이메일 입력 */}
                <div className="gap-spacing-2xs flex flex-col">
                  <label className="font-title4 text-label-strong">
                    계정 이메일
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-border-subtle bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:ring-label-primary rounded-2xs w-full border focus:outline-none focus:ring-1"
                  />
                </div>

                {/* 자기소개 */}
                <div className="gap-spacing-2xs flex flex-col">
                  <label className="font-title4 text-label-strong">
                    자기소개
                  </label>
                  <textarea
                    value={bio}
                    maxLength={500}
                    onChange={(e) => setBio(e.target.value)}
                    className="border-border-subtle bg-fill-white p-spacing-3xs font-caption2-medium text-label-default placeholder:text-label-subtler focus:border-border-primary rounded-2xs min-h-[120px] w-full resize-none border focus:outline-none"
                  />
                  <div className="text-label-subtle text-right text-xs">
                    {bio.length}/500
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

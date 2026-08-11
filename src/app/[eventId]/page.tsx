import Image from 'next/image'
import React from 'react'

export default function Page() {
  return (
    <div className='flex w-full items-center justify-center'>
      <Image
        src="/images/logo.png"
        alt="메인 이미지"
        width={500}
        height={500}
        className="w-1/4 h-auto"
        priority
      />
    </div>
  )
}

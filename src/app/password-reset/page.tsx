import { Suspense } from 'react'
import PasswordResetClient from './password-reset-client'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PasswordResetClient />
    </Suspense>
  )
}
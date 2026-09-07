'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<"request" | "verify">("request")
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendCode(e: React.FormEvent){
    e.preventDefault()

    setError('')
    setLoading(true)

    const {error} = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setStep("verify")
  }
  
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const {error} = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">
          Log in
        </h1>

        {step === "request" ?(
          <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@company.com"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        ) : ( 
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              maxLength={8}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
        </form>
      )}
      </div>
    </div>
  )
}
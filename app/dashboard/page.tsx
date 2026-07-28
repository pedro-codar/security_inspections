'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Profile = {
  name: string | null
  email: string | null
  whatsapp: string | null
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setProfile(data)
      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">Error loading profile: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6">
        <h1 className="mb-6 text-xl font-semibold text-foreground">
          Dashboard
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-foreground">{profile?.name ?? '—'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-foreground">{profile?.email ?? '—'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
            <p className="text-foreground">{profile?.whatsapp ?? '—'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="text-foreground">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-10 w-[100px] rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 w-[]"
        >
          {loggingOut ? 'Saindo...' : 'Deslogar'}
        </button>
      </div>
    </div>
  )
}

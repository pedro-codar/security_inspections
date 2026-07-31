'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Check, Coins, Gift } from 'lucide-react'

type Profile = {
  id: string
  name: string | null
  email: string | null
  whatsapp: string | null
  created_at: string
  credits: number | null
}

const DAILY_CREDITS = 10

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState('')
  const [claimError, setClaimError] = useState('')
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimedToday, setClaimedToday] = useState(false)

  const credits = Number(profile?.credits ?? 0)

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
        .select('id, name, email, whatsapp, created_at, credits')
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

  async function handleClaimDailyCredits() {
    if (!profile || claimedToday || claiming) return

    setClaiming(true)
    setClaimError('')

    const supabase = createClient()
    const nextCredits = credits + DAILY_CREDITS

    const { data, error } = await supabase
      .from('profile')
      .update({ credits: nextCredits })
      .eq('id', profile.id)
      .select('id, name, email, whatsapp, created_at, credits')
      .single()

    setClaiming(false)

    if (error) {
      setClaimError(error.message)
      return
    }

    setProfile(data)
    setClaimedToday(true)
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
    <div className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-[350px] flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Olá,</p>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {profile?.name ?? 'Usuário'}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="border-border text-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50"
          >
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </header>

        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="from-primary/10 via-accent to-card flex flex-col items-center gap-3 bg-gradient-to-b px-6 pt-10 pb-8 text-center">
            <span className="bg-primary/15 text-primary ring-primary/20 flex size-12 items-center justify-center rounded-2xl ring-1">
              <Coins className="size-6" />
            </span>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Seus créditos
            </p>
            <p className="text-foreground text-5xl font-semibold tracking-tight tabular-nums">
              {credits}
            </p>
            <p className="text-muted-foreground text-sm">
              disponíveis para usar hoje
            </p>
          </div>

          <div className="border-border space-y-4 border-t px-6 py-6">
            <div className="flex items-start gap-3">
              <span className="bg-accent text-accent-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                <Gift className="size-4" />
              </span>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Créditos diários
                </p>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  Resgate +{DAILY_CREDITS} créditos gratuitos uma vez por dia.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClaimDailyCredits}
              disabled={claimedToday || claiming}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                claimedToday
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60'
              }`}
            >
              {claimedToday ? (
                <>
                  <Check className="size-4" />
                  Créditos já resgatados hoje
                </>
              ) : claiming ? (
                'Resgatando...'
              ) : (
                <>
                  <Gift className="size-4" />
                  Resgatar {DAILY_CREDITS} créditos diários
                </>
              )}
            </button>

            {claimError && (
              <p className="text-destructive text-center text-sm">{claimError}</p>
            )}

            {claimedToday && (
              <p className="text-muted-foreground text-center text-xs">
                Volte amanhã para resgatar mais {DAILY_CREDITS} créditos.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

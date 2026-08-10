'use client'

import { useState, useEffect } from 'react'
import { Coins, Gift, IdCard, Mail, Phone } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Credits } from '../actions/credits'
import { toast } from 'sonner'

interface Profile {
    id: string
    name: string
    email: string
    credits: number
    whatsapp: string
}

export default function RaceCondition1Page() {
  const [claimed, setClaimed] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(){
        const {data: {session}} = await supabase.auth.getSession()

        if(!session) router.push('/auth/login')

        const {data: profileData} = await supabase
            .from('profile')
            .select('id, name, whatsapp, email, credits')
            .eq('id', session?.user.id)
            .single()

        if(!profileData) router.push('/auth/login')

        setProfile(profileData)
    }

    fetchProfile()
  }, [])
  async function handleClaimCredits() {

    const supabase = createClient()

    if (claimed) return

    const result = await Credits(Number(profile?.credits))

    if(result.error){
      toast.error(result.error)
    }

    toast.success(result.success)

    const {data: profileData} = await supabase
      .from('profile')
      .select('id, name, whatsapp, email, credits')
      .eq('id', profile?.id)
      .single()

    if(!profileData) router.push('/auth/login')

    setProfile(profileData)

    setClaimed(true)
  }

  return (
    <div className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <header>
          <p className="text-muted-foreground text-sm">Olá,</p>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {profile?.name}
          </h1>
        </header>

        {!claimed ? (
          <section className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="from-primary/10 via-accent to-card flex flex-col items-center gap-3 bg-gradient-to-b px-6 pt-10 pb-8 text-center">
              <span className="bg-primary/15 text-primary ring-primary/20 flex size-12 items-center justify-center rounded-2xl ring-1">
                <Coins className="size-6" />
              </span>
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Seus créditos
              </p>
              <p className="text-foreground text-5xl font-semibold tracking-tight tabular-nums">
                {profile?.credits}
              </p>
              <p className="text-muted-foreground text-sm">
                disponíveis na plataforma
              </p>
            </div>

            <div className="border-border space-y-4 border-t px-6 py-6">
              <div className="flex items-start gap-3">
                <span className="bg-accent text-accent-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Gift className="size-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    Créditos de primeiro acesso
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                    Resgate +10 créditos para usar na plataforma.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimCredits}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold shadow-lg shadow-primary/20 transition-colors"
              >
                <Gift className="size-4" />
                Resgatar 10 créditos
              </button>
            </div>
          </section>
        ) : (
          <section className="border-border bg-card overflow-hidden rounded-2xl border">
            <div className="from-primary/10 via-accent to-card border-border relative overflow-hidden border-b bg-gradient-to-r px-6 py-5">
              <div
                aria-hidden
                className="bg-primary/25 pointer-events-none absolute -top-6 right-0 size-28 rounded-full blur-2xl"
              />
              <p className="text-foreground relative text-base font-semibold">
                Seus dados
              </p>
              <div className="relative mt-3 flex items-center gap-2">
                <span className="bg-primary/15 text-primary ring-primary/25 flex size-8 items-center justify-center rounded-lg ring-1">
                  <Coins className="size-4" />
                </span>
                <p className="text-sm font-medium">
                  <span className="text-muted-foreground">Créditos atualizados:</span>{' '}
                  <span className="from-primary via-accent-foreground to-primary animate-pulse bg-gradient-to-r bg-clip-text text-2xl font-black tracking-tight text-transparent tabular-nums">
                    {profile?.credits}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Mail className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-foreground mt-0.5 text-sm">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    WhatsApp
                  </p>
                  <p className="text-foreground mt-0.5 text-sm">
                    {profile?.whatsapp}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl">
                  <IdCard className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    CPF
                  </p>
                  <p className="text-foreground mt-0.5 text-sm">123.456.789-10</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

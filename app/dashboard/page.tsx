'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  SquarePen,
} from 'lucide-react'

interface Profile {
  id: string
  name: string | null
  whatsapp: string | null
  email: string | null
  role: 'admin' | 'user' | string
  profile_image_url: string | null
}

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileList, setProfileList] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profile')
        .select('*')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setProfileList(data)
      setProfile(data.find((s) => s.id === session.user.id))
      setLoading(false)
    }

    fetchProfile()
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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen justify-center bg-muted/40">
      <div className="bg-background flex min-h-screen w-full max-w-[390px] flex-col shadow-xl">
        <header className="border-border sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/15 text-primary flex size-9 items-center justify-center rounded-xl">
                <LayoutDashboard className="size-4" />
              </span>
              <div>
                <p className="text-foreground text-sm font-semibold leading-tight">
                  Dashboard Admin
                </p>
                <p className="text-muted-foreground text-xs">
                  {profile?.name ?? 'Usuário'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                disabled={loggingOut}
                className="border-border text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg border disabled:opacity-50"
                aria-label="Sair"
              >
                <Settings className="size-5" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="border-border text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg border disabled:opacity-50"
                aria-label="Sair"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 px-4 py-4 pb-8">
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="text-primary size-4" />
                <h2 className="text-foreground text-sm font-semibold">
                  Lista de Usuários
                </h2>
              </div>
              <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                {profileList.length}
              </span>
            </div>

            {profileList.length === 0 ? (
              <div className="border-border bg-card flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center">
                <Package className="text-muted-foreground size-8" />
                <p className="text-foreground text-sm font-medium">
                  Nenhum produto ainda
                </p>
                <p className="text-muted-foreground max-w-[220px] text-xs leading-relaxed">
                  Compre um item acima para ver seus produtos aqui.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {profileList.map((item) => {
                  return (
                    <li
                      key={item.id}
                      className="border-border bg-card flex gap-3 overflow-hidden rounded-2xl border p-3"
                    >
                      {item.profile_image_url && ( 
                        <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-xl">
                          <img
                            src={item.profile_image_url}
                            className="size-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="text-primary mt-0.5 text-xs font-medium">
                          {item.email}
                        </p>
                        <p className="text-primary mt-0.5 text-xs font-medium">
                          {item.whatsapp}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="bg-primary text-primary-foreground hover:bg-destructive/90 mt-auto rounded-xl px-2 py-2 text-xs font-semibold transition-colors"
                      >
                        <SquarePen className='h-5 w-4'/>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

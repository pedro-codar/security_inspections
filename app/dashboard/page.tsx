'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  LayoutDashboard,
  LogOut,
  Plus,
  Shield,
  Users,
  Package,
  Settings,
  Trash2,
} from 'lucide-react'

interface Profile {
  id: string
  name: string | null
  email: string | null
  role: 'admin' | 'user' | string
}

type MockUser = {
  id: string
  name: string
  email: string
}

type MockProduct = {
  id: string
  name: string
  price: string
}

const INITIAL_USERS: MockUser[] = [
  { id: '1', name: 'Ana Costa', email: 'ana@empresa.com' },
  { id: '2', name: 'Bruno Lima', email: 'bruno@empresa.com' },
  { id: '3', name: 'Carla Dias', email: 'carla@empresa.com' },
]

const INITIAL_PRODUCTS: MockProduct[] = [
  { id: '1', name: 'Plano Básico', price: 'R$ 49' },
  { id: '2', name: 'Plano Pro', price: 'R$ 99' },
]

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  const [users, setUsers] = useState(INITIAL_USERS)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)

  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [adminNotice, setAdminNotice] = useState('')

  const isAdmin = profile?.role === 'admin'

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
        .select('id, name, email, role')
        .eq('id', session.user.id)
        .single()

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setProfile(data)
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

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return

    setUsers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newUserName.trim(),
        email: newUserEmail.trim(),
      },
    ])
    setNewUserName('')
    setNewUserEmail('')
    setAdminNotice('Usuário adicionado (mock)')
  }

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!newProductName.trim() || !newProductPrice.trim()) return

    setProducts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newProductName.trim(),
        price: newProductPrice.trim(),
      },
    ])
    setNewProductName('')
    setNewProductPrice('')
    setAdminNotice('Produto adicionado (mock)')
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  function removeProduct(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
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
                  Dashboard
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
          <section className="border-border bg-card rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Sua conta
            </p>
            <p className="text-foreground mt-1 text-base font-semibold">
              {profile?.email}
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Bem-vindo ao painel. Aqui você acompanha suas informações.
            </p>
          </section>

          <section className="border-border bg-card rounded-2xl border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Package className="text-muted-foreground size-4" />
              <h2 className="text-foreground text-sm font-semibold">
                Produtos
              </h2>
            </div>
            <ul className="space-y-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="bg-muted/60 flex items-center justify-between rounded-xl px-3 py-2.5"
                >
                  <span className="text-foreground text-sm">{product.name}</span>
                  <span className="text-muted-foreground text-xs font-medium">
                    {product.price}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Intentionally client-only role check — admin UI */}
          {isAdmin && (
            <>
              <div className="bg-primary/10 text-primary flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold">
                <Shield className="size-3.5 shrink-0" />
                Área administrativa
              </div>

              {adminNotice && (
                <p className="bg-accent text-accent-foreground rounded-xl px-3 py-2 text-xs">
                  {adminNotice}
                </p>
              )}

              <section className="border-primary/30 bg-card rounded-2xl border-2 border-dashed p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="text-primary size-4" />
                  <h2 className="text-foreground text-sm font-semibold">
                    Gerenciar usuários
                  </h2>
                </div>

                <ul className="mb-4 space-y-2">
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="border-border flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {user.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUser(user.id)}
                        className="text-destructive hover:bg-destructive/10 flex size-8 shrink-0 items-center justify-center rounded-lg"
                        aria-label={`Remover ${user.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleAddUser} className="space-y-2.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    Adicionar usuário
                  </p>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome"
                    className="border-border bg-input text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Email"
                    className="border-border bg-input text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
                  >
                    <Plus className="size-4" />
                    Criar usuário
                  </button>
                </form>
              </section>

              <section className="border-primary/30 bg-card rounded-2xl border-2 border-dashed p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Settings className="text-primary size-4" />
                  <h2 className="text-foreground text-sm font-semibold">
                    Cadastrar produto
                  </h2>
                </div>

                <ul className="mb-4 space-y-2">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="border-border flex items-center justify-between gap-2 rounded-xl border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {product.price}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="text-destructive hover:bg-destructive/10 flex size-8 shrink-0 items-center justify-center rounded-lg"
                        aria-label={`Remover ${product.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleAddProduct} className="space-y-2.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    Novo produto
                  </p>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Nome do produto"
                    className="border-border bg-input text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="Preço (ex: R$ 149)"
                    className="border-border bg-input text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
                  >
                    <Plus className="size-4" />
                    Criar produto
                  </button>
                </form>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

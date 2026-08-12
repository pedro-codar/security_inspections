'use client'

import { useState, useEffect, use } from 'react'
import { toast } from 'sonner'
import { ShoppingBag, ShoppingCart, Package, Trash, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { ByProduct } from '../actions/shop'

interface Product {
    id: string
    name: string
    price: number
    url: string
}

interface MyProducts {
    id: string
    profile_id: string
    product_id: string
}

interface Profile {
    id: string
    email: string
    name: string
    whatsapp: string
    credits: number
}

export default function Shop() {
  const [productList, setProductlist] = useState<Product[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myProducts, setMyProducts] = useState<MyProducts[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll(){
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        toast.error("Unauthorized")
        return
    }

    const [productRes, profileRes, myProductRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('profile').select('*').eq('id', user.id).single(),
        supabase.from('buy').select('*').eq('profile_id', user.id)
    ])

    if(productRes.error) toast.error(productRes.error.message)
    if(profileRes.error) toast.error(profileRes.error?.message)
    if(myProductRes.error) toast.error(myProductRes.error?.message)

    setProductlist(productRes.data ?? [])
    setProfile(profileRes.data ?? null)
    setMyProducts(myProductRes.data ?? [])
  }

  async function handleDeleteProduct(product: string){
    const supabase = createClient()

    const {error} = await supabase
      .from('buy')
      .delete()
      .eq('id', product)

    if(error){
      toast.error(error.message)
      return
    }

    fetchAll()
    toast.success('Produto deletado com sucesso.')
  }

  async function handleBuy(product: string) {
    setIsLoading(true)

    const result = await ByProduct(product)

    if(result.error){
      toast.error(result.error)
      setIsLoading(false)
      return
    }
    setIsLoading(false)
    fetchAll()
    toast.success('Produto comprado com sucesso.')
  }

  return (
    <div className="flex min-h-screen justify-center bg-muted/40">
      <div className="bg-background flex min-h-screen w-full max-w-[390px] flex-col shadow-xl">
        <header className="border-border sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="bg-primary/15 text-primary flex size-9 items-center justify-center rounded-xl">
              <ShoppingBag className="size-4" />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold leading-tight">
                 Olá,  {profile?.name}
              </p>
              <p className="text-muted-foreground text-[14px] font-medium">
                Saldo atual: R$ {profile?.credits}
              </p>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-4 py-5 pb-8">
          {/* Shop products */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <ShoppingCart className="text-primary size-4" />
              <h2 className="text-foreground text-sm font-semibold">
                Produtos da loja
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {productList.map((item) => (
                <article
                  key={item.id}
                  className="border-border bg-card flex flex-col overflow-hidden rounded-2xl border"
                >
                  <div className="bg-muted aspect-square overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-primary mt-0.5 text-xs font-medium">
                        R$ {item.price}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(item.id)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 mt-auto w-full rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Carregando' : 'Comprar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* My products */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="text-primary size-4" />
                <h2 className="text-foreground text-sm font-semibold">
                  Meus produtos
                </h2>
              </div>
              <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                {myProducts.length}
              </span>
            </div>

            {myProducts.length === 0 ? (
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
                {myProducts.map((item) => {
                  const product = productList.find((s) => s.id === item.product_id)
                  if (!product) return null

                  return (
                    <li
                      key={item.id}
                      className="border-border bg-card flex gap-3 overflow-hidden rounded-2xl border p-3"
                    >
                      <div className="bg-muted size-20 shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={product.url}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {product.name}
                        </p>
                        <p className="text-primary mt-0.5 text-xs font-medium">
                          {product.price}
                        </p>
                        <p className="text-muted-foreground mt-1 text-[10px]">
                          Compra #{item.id}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(item.id)}
                        className="bg-destructive text-primary-foreground hover:bg-destructive/90 mt-auto rounded-xl px-2 py-2 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className='h-5 w-4'/>
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

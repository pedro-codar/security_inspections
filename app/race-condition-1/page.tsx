'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Checkout } from '../actions/checkout';

interface Products {
    id: string
    name: string
    price: number
}

interface Coupons {
    id: string
    name: string
    porcentage: number
}

type Screen = 'list' | 'checkout'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function ProductList() {
    const [message, setMessage] = useState('');
    const [products, setProducts] = useState<Products[]>([])
    const [coupons, setCoupons] = useState<Coupons[]>([])
    const [productSelected, setProductSelected] = useState<Products | null>(null)
    const [screen, setScreen] = useState<Screen>('list')
    const [selectedCoupon, setSelectedCoupon] = useState<Coupons | null>(null)
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        async function fetchData(){
            const {data: {session}} = await supabase.auth.getSession()

            if (!session) {
                router.push('/auth/login')
                return
            }

            try {
                const [productRes, couponRes] = await Promise.all([
                supabase.from('products').select('id, name, price'),
                supabase.from('coupon').select('id, name, porcentage'),
                ])

                if (productRes.error) throw productRes.error
                if (couponRes.error) throw couponRes.error

                setProducts(productRes.data ?? [])
                setCoupons(couponRes.data ?? [])
            } catch(errr){
                console.error("Fail to fetch data")
            }
        }

        fetchData()
    }, [])

    if (!products || products.length === 0) {
        return (
            <div className="p-10 text-center font-['Space_Grotesk',_sans-serif] text-sm text-[#1B1B1B]/60">
                No products yet.
            </div>
        );
    }

    function calcFinalPrice(productPrice: number, counponPorcentage: number){
        if(!productPrice || !counponPorcentage) return

        const price = productPrice * (counponPorcentage/100)

        return productPrice - price
    }

    async function handleCreateBuy(){
        if(!selectedCoupon || !productSelected){
            toast.error('error to fetch data')
            return
        }
 
        const result = await Checkout(productSelected.id, selectedCoupon.id)

        if(result?.error){
            toast.error(result.error)
            return
        }

        toast.success(result?.success)
        setProductSelected(null)
        setSelectedCoupon(null)
        setScreen('list')
       
    }

    return (

        <div className="mx-auto max-w-5xl p-6">

            {screen === 'list' &&
                <>
                <div className="mb-6 flex items-baseline justify-between">
                    <h2 className="font-['Space_Grotesk',_sans-serif] text-2xl font-medium text-[#1B1B1B]">
                    Products
                    </h2>
                    <span className="font-mono text-xs text-[#1B1B1B]/50">
                    {products.length} items
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div key={product.id} className="group relative flex flex-col justify-between rounded-none border border-[#232323]/12 bg-[#FAFAF8] p-5 transition-colors hover:border-[#232323]/30">
                            
                            {/* index tag — quiet structural device, reads like a stock number */}
                            <span className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-[#232323]/35">
                                {String(product.id).padStart(3, '0')}
                            </span>

                            <h3 className="pr-10 font-['Space_Grotesk',_sans-serif] text-lg font-medium leading-snug text-[#1B1B1B]">
                                {product.name}
                            </h3>

                            <div className="mt-6 flex items-end justify-between border-t border-dashed border-[#232323]/20 pt-4">
                                <span className="font-mono text-base text-[#1B1B1B]">
                                    {formatPrice(product.price)}
                                </span>

                                <button
                                    onClick={() => {
                                        setProductSelected(product)
                                        setScreen('checkout')
                                    }}
                                    className="rounded-none bg-[#1B1B1B] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#FAFAF8] transition-colors hover:bg-[#C0521F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0521F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {message && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-none bg-[#1B1B1B] px-4 py-2 font-mono text-xs text-[#FAFAF8] shadow-lg">
                        {message}
                    </div>)
                }
                </>
            }

            {screen === 'checkout' &&
                <>
                <div className="mx-auto max-w-md rounded-none border border-[#232323]/12 bg-[#FAFAF8] p-6">

                    <button
                        className="rounded-none bg-[#1B1B1B] px-5 py-2 text-xs font-medium uppercase tracking-wider text-[#FAFAF8] transition-colors hover:bg-[#C0521F] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0521F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
                        onClick={() => {
                            setSelectedCoupon(null)
                            setProductSelected(null)
                            setScreen('list')
                        }}
                >
                        Voltar
                    </button>

                    <h2 className="font-['Space_Grotesk',_sans-serif] text-xl font-medium text-[#1B1B1B]">
                        {productSelected?.name}
                    </h2>
                
                    <div className="mt-6">
                        <span className="font-mono text-xs uppercase tracking-wider text-[#1B1B1B]/50">
                            Coupon
                        </span>
                
                        <div className="mt-2 flex flex-col gap-2">
                        {coupons.map((coupon) => {
                            const isSelected = selectedCoupon === coupon;
                            return (
                            <button
                                key={coupon.name}
                                type="button"
                                onClick={() => setSelectedCoupon(isSelected ? null : coupon)}
                                className={`flex items-center justify-between border px-3 py-2 text-left transition-colors ${
                                isSelected
                                    ? 'border-[#C0521F] bg-[#C0521F]/8'
                                    : 'border-[#232323]/15 hover:border-[#232323]/30'
                                }`}
                            >
                                <span className="font-mono text-sm text-[#1B1B1B]">
                                {coupon.name}
                                </span>
                                <span className="font-mono text-xs text-[#1B1B1B]/60">
                                -{coupon.porcentage}%
                                </span>
                            </button>
                            );
                        })}
                        </div>
                    </div>
                
                    <div className="mt-6 flex items-end justify-between border-t border-dashed border-[#232323]/20 pt-4">
                        <div className="flex flex-col">
                
                            <span className="font-mono text-xs text-[#1B1B1B]/40 line-through">
                                {productSelected?.price}
                            </span>
                    
                        <span className="font-mono text-lg text-[#1B1B1B]">
                            {calcFinalPrice(Number(productSelected?.price), Number(selectedCoupon?.porcentage))}
                        </span>
                        </div>
                
                        <button
                            className="rounded-none bg-[#1B1B1B] px-5 py-2 text-xs font-medium uppercase tracking-wider text-[#FAFAF8] transition-colors hover:bg-[#C0521F] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0521F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
                            onClick={handleCreateBuy}
                    >
                            Buy
                        </button>
                    </div>
                
                    </div>
                </>
            }

        </div>
    );
}
'use server'

import { createClient } from "@/utils/supabase/server"

export async function ByProduct(productId: string) {
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        return {error: 'Unauthorized'}
    }

    const [profileRes, productRes] = await Promise.all([
        supabase.from('profile').select('credits').eq('id', user.id).single(),
        supabase.from('products').select('price').eq('id', productId).single()
    ])

    if(profileRes.error) return {error: profileRes.error?.message}
    if(productRes.error) return {error: productRes.error.message}

    if(profileRes.data.credits < productRes.data.price) return {error: "No money enough to buy this product."}

    const {error: createError} = await supabase
        .from('buy')
        .insert({
            profile_id: user.id,
            product_id: productId
        })
    
    if(createError) return {error: createError.message}

    const {error: updateError} = await supabase
        .from('profile')
        .update({
            'credits': profileRes.data.credits-productRes.data.price
        })
        .eq('id', user.id)

    if (updateError) return {error: updateError.message}

    return {success: true}

}
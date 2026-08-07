"use server"

import { createClient } from "@/utils/supabase/server"

export async function Checkout(product: string, coupon: string){
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if(!user){ 
        return{error: "Unauthorized"}
    }

    const {data} = await supabase
        .from('buy')
        .select('*')
        .eq('profile_id', user.id)
        .eq('coupon_id', coupon)
        .maybeSingle()
    
    if (data) {
        return {error: "You already have used that coupon, select other!"}
    }

    const {error} = await supabase
        .from('buy')
        .insert({
            'profile_id': user.id,
            'product_id': product,
            'coupon_id': coupon,
        })

    if (error) {
        return {error: "Error to create the transaction"}
    }

    return { success: "Transaction done"};
}
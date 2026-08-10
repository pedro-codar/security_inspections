'use server'

import { createClient } from "@/utils/supabase/server"

export async function Credits() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: creditsData } = await supabase
        .from('credits_aclaim')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle()

    if (creditsData) {
        return { error: "You already aclaimed that credits." }
    }

    const { error: creditsError } = await supabase
        .from('credits_aclaim')
        .insert({
            'profile_id': user.id
        })

    if (creditsError) {
        return { error: "Error to insert a new row in credits_aclaim" }
    }

    const {data: profileData} = await supabase
        .from('profile')
        .select('credits')
        .eq('id', user.id)
        .single()

    const {error: profileError} = await supabase
        .from('profile')
        .update({
            'credits': profileData?.credits + 10
        })
        .eq('id', user.id)
    
    if (profileError) {
        return { error: profileError.message }
    }

    return { success: "Credits aclaimed" }
}

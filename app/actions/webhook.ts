"use server"

import { createClient } from "@/utils/supabase/server"

export async function callWebhook(name: string){
    const supabase = await createClient()

    const {data: {user}} = await supabase.auth.getUser()

    if(!user){ 
        return{error: "Unauthorized"}
    }

    const response = await fetch("https://n8n-qao4.srv1444382.hstgr.cloud/webhook/16d63198-d989-4fcb-98b4-e125c3fd570b", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name})
    })

    const data = await response.json().catch(() => null)
    return { data }
}
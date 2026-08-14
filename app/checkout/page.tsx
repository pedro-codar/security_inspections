'use client'

import { useState } from "react"

const PRODUCT_PRICE = 200

export default function Checkout(){
    const [isMember, setIsMember] = useState(false)
    const [message, setMessage] = useState('')

    function calcTotal(){
        let discount = 0
         if (isMember) discount = 0.5
         const total = PRODUCT_PRICE * (1-discount)
         return total
    }

    async function handleCheckout(){
        const total = calcTotal()

        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({total, isMember}),
        })

        const data = await res.json()
        setMessage(data.message)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
  <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
    <div className="mb-1 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-card-foreground">
        Client-Trusted Pricing
      </h1>
      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
        Practice
      </span>
    </div>
    <p className="mb-5 text-xs text-muted-foreground">
      Everything on this screen is calculated in the browser — try tampering with it.
    </p>

    <div className="mb-4 flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
      <span className="text-sm text-secondary-foreground">Product price</span>
      <span className="font-mono text-sm font-medium text-foreground">
        R$ {PRODUCT_PRICE}
      </span>
    </div>

    <label className="mb-5 flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent/40">
      <input
        type="checkbox"
        checked={isMember}
        onChange={(e) => setIsMember(e.target.checked)}
        className="size-4 accent-[var(--primary)]"
      />
      <span className="text-sm text-foreground">I&apos;m a member (50% off)</span>
    </label>

    <div className="mb-5 flex items-end justify-between border-t border-dashed border-border pt-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        Total
      </span>
      <span className="font-mono text-xl font-semibold text-foreground">
        R$ {calcTotal()}
      </span>
    </div>

    <button
      onClick={handleCheckout}
      className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Checkout
    </button>

    {message && (
      <p className="mt-4 rounded-lg bg-accent px-3 py-2 text-center text-xs font-medium text-accent-foreground">
        {message}
      </p>
    )}
  </div>
</div>
    )
}
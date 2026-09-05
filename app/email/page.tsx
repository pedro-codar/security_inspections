'use client'

import { useState } from "react"

const DAILY_LIMIT = 5

export default function EmailFormatter() {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleFormat() {
    if (isLimitReached || !text.trim()) return

    setIsLoading(true)

    // Simulated call — replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 900))
    setResult(
      "Prezado(a),\n\nEspero que esteja bem. Gostaria de solicitar o envio do relatório até sexta-feira, conforme combinado anteriormente.\n\nFico à disposição para qualquer esclarecimento.\n\nAtenciosamente."
    )
    setUsesLeft((prev) => prev - 1)
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-card-foreground">
            Formatar Email com IA
          </h1>
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
            Beta
          </span>
        </div>

        <p className="mb-5 text-xs text-muted-foreground">
          Cole um texto informal e a IA reescreve como um email profissional.
        </p>

        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Seu texto
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="cole o que você já escreveu..."
          rows={4}
          disabled={isLimitReached}
          className="mb-4 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <button
          onClick={handleFormat}
          disabled={!text.trim() || isLoading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Formatando..." : isLimitReached ? "Limite diário atingido" : "Formatar Email"}
        </button>

        {result && (
          <div className="mt-5 border-t border-dashed border-border pt-4">
            <span className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
              Resultado
            </span>
            <p className="whitespace-pre-line rounded-lg bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              {result}
            </p>
          </div>
        )}

        {isLimitReached && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive">
            Você atingiu o limite gratuito de hoje. Volte amanhã ou assine o plano Pro.
          </p>
        )}
      </div>
    </div>
  )
}
'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

    async function handleSendEmail(Event: React.FormEvent){
        Event.preventDefault()

        if(!email){
            toast.error("Digite o email.")
            return
        }
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Redefinição de senha',
                    htmlContent: '<p>Clique no link para redefinir sua senha.</p>',
                })
            })
            if (!res.ok) toast.error('Falha ao enviar email')
            setEmailSent(true)
            toast.success("Email enviado com sucesso")
            
        } catch {
            setError('Erro ao enviar email')
        } finally {
            setLoading(false)
        }
    }



  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {!emailSent ? (
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h1 className="text-xl font-bold text-foreground">
                Recuperar Senha
            </h1>
            <h2 className='font-light text-[14spx] mb-6'>Informe seu e-mail e enviaremos um link para redefinir sua senha.</h2>

            <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                Email
                </label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@company.com"
                />
            </div>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
                Enviar link de alteração
            </button>
            </form>
        </div>
      ) : (
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <h1 className="text-xl font-bold text-foreground">
                Email enviado com sucesso
            </h1>
            <h2 className='font-light text-[14spx] mb-6'>Verifique sua caixa de email.</h2>
            
            <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
                Voltar
            </button>
        </div>
      )}
      
    </div>
  )
}
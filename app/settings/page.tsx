'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Upload, User, Lock, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ProfileSettings() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  
  function sanitizeStorageFileName(fileName: string): string {
    const withoutAccents = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  
    const trimmed = withoutAccents.trim()
    if (!trimmed) return 'arquivo'
  
    const lastDot = trimmed.lastIndexOf('.')
    const hasExtension = lastDot > 0 && lastDot < trimmed.length - 1
    const base = hasExtension ? trimmed.slice(0, lastDot) : trimmed
    const extension = hasExtension ? trimmed.slice(lastDot) : ''
  
    const safeBase =
      base
        .replace(/[^\w.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^[_.-]+|[_.-]+$/g, '') || 'arquivo'
  
    const safeExtension = extension.toLowerCase().replace(/[^\w.]/g, '').slice(0, 21)
  
    return `${safeBase}${safeExtension}`
  }
  
  async function handleSave(value: React.FormEvent){
    value.preventDefault()

    const supabase = createClient()

    if(!selectedFile) {
        toast.error('Selecione o arquivo')
        return
    }

    const safeName = sanitizeStorageFileName(selectedFile.name)
    const path = `${Date.now()}-${safeName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile_image")
        .upload(path, selectedFile, { upsert: false })

    if (uploadError){
        toast.error(uploadError.message)
        return
    }

    toast.success("Usuário não autenticado.")

  }
  
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setSelectedFile(file)
  }

  return (
    <div className="flex min-h-screen justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-4">
        <div className='mb-4 flex items-center gap-2'>
            <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="border-border text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-lg border disabled:opacity-50"
                aria-label="Sair"
            >
                <ArrowLeft className="size-5" />
            </button>

            <h1 className="text-lg font-semibold text-foreground">
            Configurações de perfil
            </h1>
        </div>

        {/* Section 1: Upload file */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Upload className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">
              Foto de perfil
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                  Sem foto
                </div>
              )}
            </div>

            <label className="cursor-pointer rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent/40">
              Escolher arquivo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>

            <button
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={handleSave}
            >
              Salvar
            </button>

          </div>
        </section>

        {/* Section 2: Name + email */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">
              Dados pessoais
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="seu@email.com"
              />
            </div>

            <button
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Salvar dados
            </button>
          </div>
        </section>

        {/* Section 3: Password */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">
              Alterar senha
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Nova senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <button
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Atualizar senha
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
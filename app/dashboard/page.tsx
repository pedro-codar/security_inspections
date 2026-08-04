'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Send } from "lucide-react"

interface TasksList {
  id: string
  title: string
  description: string
}

interface Profile {
  id: string
  name: string
  email: string
  whatsapp: string
  credits: number
  role: 'admin' | 'user'
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY!

const SHOW_DASHBOARD = false

export default function Dashboard() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState<TasksList[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile() {
      const {data: {session}} = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      const {data: profileData, error: profileError} = await supabase
        .from("profile")
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError){
        setError(profileError.message)
        return
      }

      if (!profileData){
        setError("Nenhum dado retornado")
        return
      }

      setProfile(profileData)

      const {data, error} = await supabase
        .from('tasks')
        .select('id, title, description')

      if (error) {
        setError(error.message)
        return
      }

      if (!data) {
        router.push("/auth/login")
        return
      }

      setTasks(data)
    }

    fetchProfile()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault()

    const supabase = createClient()

    if (!title || !description) {
      setError('Preencha os campos')
      return
    }

    const {error: errorCreate} = await supabase
      .from('tasks')
      .insert({
        'title': title,
        'description': description
      })

    if(errorCreate){
      setError(errorCreate.message)
      return
    }

    setTitle('')
    setDescription('')

  }

  async function handleLogout(){
    const supabase = createClient()
    const {error} = await supabase.auth.signOut()
    
    if (error) {
      setError(error.message)
      return
    }

    router.push('/auth/login')
  }

  async function handleSendChat(event: React.FormEvent) {
    event.preventDefault()

    const question = input.trim()
    if (!question || chatLoading) return

    setChatError('')
    setInput('')

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setChatLoading(true)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.message || 'Falha na requisição à OpenAI')
      }

      const answer =
        data?.choices?.[0]?.message?.content?.trim() ||
        'Sem resposta da IA.'

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: answer,
        },
      ])
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Erro ao falar com a IA')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <>
      {/* Chat — OpenAI token test */}
      <div className="flex flex-col items-center justify-center bg-background px-4 py-8 ">
        <div className="flex w-full max-w-xl flex-col gap-4">
          <header>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Teste OpenAI
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Envie uma mensagem para testar o token.
            </p>
          </header>

          <div className="border-border bg-card flex min-h-[420px] max-w-[350px] flex-1 flex-col overflow-hidden rounded-xl border">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && !chatLoading && (
                <p className="text-muted-foreground py-16 text-center text-sm">
                  Nenhuma mensagem ainda. Pergunte algo abaixo.
                </p>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-2xl px-3.5 py-2.5 text-sm">
                    Pensando...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {chatError && (
              <p className="text-destructive border-border border-t px-4 py-2 text-sm">
                {chatError}
              </p>
            )}

            <form
              onSubmit={handleSendChat}
              className="border-border flex gap-2 border-t p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={chatLoading}
                className="border-border bg-input text-foreground flex-1 rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={chatLoading || !input.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              >
                <Send className="size-4" />
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Existing dashboard — hidden while testing chat */}
      {SHOW_DASHBOARD && (
        <div className="flex flex-col items-center justify-center min-h-screen p-10">

            {profile?.role === 'admin' && <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="type the task title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                  placeholder="type the tasks description"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Create Task
              </button>
            </form> }

          {error ?? <p>{error}</p>}

          <table className="flex flex-col border border-muted-foreground rounded-lg p-5 max-w-[800px] w-full">

            <thead>
              <tr className="flex gap-2 gap-10 justify-between border-b border-muted-foreground">
                <th className="flex flex-col w-[100px] items-start">Title</th>
                <th className="flex flex-col w-[100px] items-start">Description</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((item) =>  
                <tr key={item.id} className="flex gap-10 justify-between border-b border-muted-foreground">
                  <td className="flex flex-col w-[100px] items-start">{item.title}</td>
                  <td className="flex flex-col w-[100px] items-start">{item.description}</td>
                </tr>
              )}
            </tbody>

          </table>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            onClick={handleLogout}
          >
            Deslogar
          </button>

        </div>
      )}
    </>
  )
}

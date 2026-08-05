'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

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

export default function Dashboard() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [tasks, setTasks] = useState<TasksList[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)

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

  return (
  
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
  )
}

'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET = 'instagram-video'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    const isPdf =
      selected.type === 'application/pdf' ||
      selected.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      toast.error('Only PDF files are allowed')
      e.target.value = ''
      setFile(null)
      return
    }

    if (selected.size >= MAX_SIZE) {
      toast.error('File must be less than 5MB')
      e.target.value = ''
      setFile(null)
      return
    }

    setFile(selected)
  }

  async function handleSave() {
    if (!file) {
      toast.error('Select a PDF first')
      return
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed')
      return
    }

    if (file.size >= MAX_SIZE) {
      toast.error('File must be less than 5MB')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const safeName = file.name.replace(/[^\w.\-]+/g, '_')
    const path = `${Date.now()}-${safeName}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Upload successful')
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-none border border-[#232323]/12 bg-[#FAFAF8] p-6">
        <h1 className="font-['Space_Grotesk',_sans-serif] text-2xl font-medium text-[#1B1B1B]">
          Upload PDF
        </h1>
        <p className="mt-2 font-mono text-xs text-[#1B1B1B]/50">
          PDF only · max 5MB
        </p>

        <div className="mt-6">
          <label
            htmlFor="pdf-upload"
            className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#232323]/25 px-4 py-10 transition-colors hover:border-[#232323]/50"
          >
            <span className="font-['Space_Grotesk',_sans-serif] text-sm text-[#1B1B1B]">
              {file ? 'Change file' : 'Choose PDF'}
            </span>
            <span className="mt-1 font-mono text-[10px] tracking-wider text-[#1B1B1B]/40">
              CLICK TO SELECT
            </span>
            <input
              id="pdf-upload"
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between border border-[#232323]/12 px-3 py-2">
            <span className="truncate font-mono text-sm text-[#1B1B1B]">
              {file.name}
            </span>
            <span className="ml-3 shrink-0 font-mono text-xs text-[#1B1B1B]/50">
              {formatBytes(file.size)}
            </span>
          </div>
        )}

        <div className="mt-6 flex justify-end border-t border-dashed border-[#232323]/20 pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !file}
            className="rounded-none bg-[#1B1B1B] px-5 py-2 text-xs font-medium uppercase tracking-wider text-[#FAFAF8] transition-colors hover:bg-[#C0521F] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0521F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]"
          >
            {loading ? 'Uploading…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

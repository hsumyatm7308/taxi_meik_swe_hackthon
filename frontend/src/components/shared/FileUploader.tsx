import { useState, useRef, type ChangeEvent } from 'react'
import { Upload, X, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number
  preview?: string | null
  label?: string
  uploading?: boolean
}

export function FileUploader({
  onUpload, accept = 'image/*', maxSize = 5,
  preview, label = 'Upload file', uploading,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }
    onUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
        dragOver
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
          <button
            onClick={(e) => { e.stopPropagation(); /* clear handler */ }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs">Drag & drop or click to browse</p>
          <p className="text-xs">Max {maxSize}MB</p>
        </div>
      )}
    </div>
  )
}

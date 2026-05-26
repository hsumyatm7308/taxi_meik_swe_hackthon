import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export function ImageViewer({ images, initialIndex = 0, open, onClose }: ImageViewerProps) {
  const [index, setIndex] = useState(initialIndex)

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {images.length > 1 && index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex(index - 1) }}
            className="absolute left-4 text-white/80 hover:text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {images.length > 1 && index < images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex(index + 1) }}
            className="absolute right-4 text-white/80 hover:text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}

        <motion.img
          key={index}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={images[index]}
          alt=""
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />

        {images.length > 1 && (
          <div className="absolute bottom-4 text-white/60 text-sm">
            {index + 1} / {images.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

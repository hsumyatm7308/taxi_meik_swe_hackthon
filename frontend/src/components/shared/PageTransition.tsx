import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import React from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation()

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1], // Custom premium ease-out cubic
      }}
      className="w-full h-full flex flex-col flex-1 min-w-0"
    >
      {children}
    </motion.div>
  )
}

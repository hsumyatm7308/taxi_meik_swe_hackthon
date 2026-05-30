import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: 'up' | 'down'
  trendValue?: string
  className?: string
}

export function StatsCard({ title, value, icon, description, trend, trendValue, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={cn('h-full hover:border-slate-300 hover:shadow-md transition-all', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p>
              {description && <p className="text-xs text-slate-500">{description}</p>}
              {trend && (
                <p className={cn(
                  'text-xs font-medium',
                  trend === 'up' ? 'text-emerald-600' : 'text-red-600',
                )}>
                  {trendValue} {trend === 'up' ? '↑' : '↓'}
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

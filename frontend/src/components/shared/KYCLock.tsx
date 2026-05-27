import { Link } from 'react-router-dom'
import { useAuth } from '@/providers'
import { ShieldAlert, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KYCLockProps {
  children: React.ReactNode
  feature: string
}

const KYC_REQUIRED = ['verified', 'trusted']

export function KYCLock({ children, feature }: KYCLockProps) {
  const { user } = useAuth()

  if (user && KYC_REQUIRED.includes(user.verification_status)) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/80 backdrop-blur-[2px] p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold mb-1">KYC Verification Required</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">
          Please complete your identity verification to access {feature}.
        </p>
        <Link to="/owner/documents">
          <Button>
            Go to KYC <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      <div className="pointer-events-none select-none blur-sm opacity-30">
        {children}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarCheck, Car, CreditCard, FileCheck, MessageSquare, User,
  ShieldAlert, ShieldEllipsis, XCircle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { usersApi } from '@/api'
import { useAuth } from '@/providers'
import { isKycApproved, normalizeVerificationStatus } from '@/constants'

const featureCards = [
  {
    title: 'Browse verified cars',
    description: 'Search approved cars by brand, model, city, and pickup location.',
    path: '/driver/cars',
    action: 'Browse Cars',
    icon: Car,
  },
  {
    title: 'Send rental requests',
    description: 'Apply to rent available cars and wait for owner/admin approval.',
    path: '/driver/bookings',
    action: 'My Booking',
    icon: CalendarCheck,
  },
  {
    title: 'Manage payments',
    description: 'Upload payment proof and follow payment confirmation status.',
    path: '/driver/payments',
    action: 'Payments',
    icon: CreditCard,
  },
  {
    title: 'Complete KYC',
    description: 'Submit NRC, selfie, and driving license documents for verification.',
    path: '/driver/documents',
    action: 'KYC',
    icon: FileCheck,
  },
  {
    title: 'Stay notified',
    description: 'Receive updates for bookings, agreements, payments, and admin decisions.',
    path: '/driver/notifications',
    action: 'Notifications',
    icon: MessageSquare,
  },
  {
    title: 'Update profile',
    description: 'Keep your phone, name, and account details current.',
    path: '/driver/profile',
    action: 'Profile',
    icon: User,
  },
]

const workflowSteps = [
  'Complete KYC verification',
  'Browse available verified cars',
  'Send a rental request',
  'Wait for owner and admin approval',
  'Submit payment and deposit proof',
  'Start and manage the rental',
]

function KYCAlert({ status }: { status: string }) {
  const normalizedStatus = normalizeVerificationStatus(status)
  if (isKycApproved(normalizedStatus)) return null

  const config: Record<string, { icon: React.ReactNode; color: string; title: string; desc: string }> = {
    unverified: {
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      title: 'KYC Verification Required',
      desc: 'Please upload your documents to start booking cars.',
    },
    pending: {
      icon: <ShieldEllipsis className="w-5 h-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      title: 'KYC Under Review',
      desc: 'Your documents are being reviewed.',
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-50 border-red-200 text-red-800',
      title: 'KYC Verification Rejected',
      desc: 'Some documents were rejected. Please re-upload them.',
    },
  }

  const c = config[normalizedStatus] || config.unverified

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-4 flex items-start gap-3 ${c.color}`}>
      <div className="shrink-0 mt-0.5">{c.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{c.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{c.desc}</p>
        <Link to="/driver/documents">
          <Button size="sm" variant="link" className="h-auto p-0 mt-1 text-xs font-medium">
            Go to KYC <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

export function DriverDashboardPage() {
  const { user } = useAuth()
  const [kycStatus, setKycStatus] = useState(user?.verification_status || 'unverified')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setKycStatus(user?.verification_status || 'unverified')
  }, [user?.verification_status])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const kycRes = await usersApi.getKycStatus()

        setKycStatus(kycRes?.kycStatus || user?.verification_status || 'unverified')
      } catch {
        setKycStatus(user?.verification_status || 'unverified')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user?.verification_status])

  if (loading) return <LoadingSkeleton type="detail" count={3} />

  const kycPassed = isKycApproved(kycStatus)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Welcome back, {user?.name?.split(' ')[0] || 'Driver'}
        </p>
      </div>

      {user && <KYCAlert status={kycStatus} />}

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Driver workspace
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Everything you need to rent cars from verified owners
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Use this dashboard as a starting point for the whole driver workflow:
                verification, browsing cars, rental requests, payments, agreements,
                notifications, and profile management.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Account readiness</p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                {kycPassed ? 'Ready to rent' : 'KYC required'}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {kycPassed
                  ? 'You can browse cars and submit rental requests.'
                  : 'Complete KYC first to unlock booking features.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((feature) => {
          const Icon = feature.icon
          const locked = !kycPassed && !['/driver/documents', '/driver/profile', '/driver/notifications'].includes(feature.path)

          return (
            <Card key={feature.path} className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col p-4 sm:p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{feature.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {locked ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      KYC required
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Available
                    </span>
                  )}
                  <Link to={feature.path}>
                    <Button size="sm" variant="outline" className="gap-1">
                      {feature.action} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-950">Driver workflow</h2>
            <div className="mt-4 space-y-3">
              {workflowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-950">Quick start</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              New drivers should complete KYC first. After approval, browse available cars,
              open a car detail page to review full terms, and submit a rental request.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/driver/documents">
                <Button size="sm" variant={kycPassed ? 'outline' : 'default'}>
                  Complete KYC
                </Button>
              </Link>
              <Link to="/driver/cars">
                <Button size="sm" variant="outline">
                  Browse Cars
                </Button>
              </Link>
              <Link to="/driver/bookings">
                <Button size="sm" variant="outline">
                  My Booking
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

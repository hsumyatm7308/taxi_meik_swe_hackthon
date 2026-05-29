import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, CalendarCheck, Car,
  Users, Shield, Bell, ScrollText, DollarSign, Landmark,
  AlertTriangle, Star, Menu, X, ChevronDown, Gauge,
  PlusCircle, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, useRole } from '@/providers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { APP_NAME, isKycApproved } from '@/constants'
import { getInitials } from '@/utils/format'
import Logo from '@/assets/Logo.svg'

interface NavItem {
  label: string
  icon: React.ReactNode
  path?: string
  locked?: boolean
  children?: { label: string; path: string }[]
}

const ownerNav = (kycPassed: boolean): NavItem[] => [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/owner' },
  { label: 'My Post', icon: <FileText className="w-4 h-4" />, path: '/owner/cars', locked: !kycPassed },
  { label: 'Post Car', icon: <PlusCircle className="w-4 h-4" />, path: '/owner/cars/new', locked: !kycPassed },
  { label: 'Bookings', icon: <CalendarCheck className="w-4 h-4" />, path: '/owner/bookings', locked: !kycPassed },
  { label: 'Payments', icon: <DollarSign className="w-4 h-4" />, path: '/owner/payments', locked: !kycPassed },
  { label: 'KYC', icon: <Shield className="w-4 h-4" />, path: '/owner/documents' },
  { label: 'Profile', icon: <Users className="w-4 h-4" />, path: '/owner/profile' },
]

const driverNav = (kycPassed: boolean): NavItem[] => [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/driver' },
  { label: 'Browse Cars', icon: <Car className="w-4 h-4" />, path: '/driver/cars' },
  { label: 'My Booking', icon: <CalendarCheck className="w-4 h-4" />, path: '/driver/bookings', locked: !kycPassed },
  { label: 'Payments', icon: <DollarSign className="w-4 h-4" />, path: '/driver/payments', locked: !kycPassed },
  { label: 'KYC', icon: <Shield className="w-4 h-4" />, path: '/driver/documents' },
  { label: 'Profile', icon: <Users className="w-4 h-4" />, path: '/driver/profile' },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: <Gauge className="w-4 h-4" />, path: '/admin' },
  { label: 'Verify Owners', icon: <Users className="w-4 h-4" />, path: '/admin/verifications/owners' },
  { label: 'Verify Drivers', icon: <Users className="w-4 h-4" />, path: '/admin/verifications/drivers' },
  { label: 'Verify Cars', icon: <Car className="w-4 h-4" />, path: '/admin/verifications/cars' },
  { label: 'Bookings', icon: <CalendarCheck className="w-4 h-4" />, path: '/admin/bookings' },
  { label: 'Payments', icon: <DollarSign className="w-4 h-4" />, path: '/admin/payments' },
  { label: 'Disputes', icon: <AlertTriangle className="w-4 h-4" />, path: '/admin/disputes' },
  { label: 'Users', icon: <Users className="w-4 h-4" />, path: '/admin/users' },
  { label: 'Deposits', icon: <Landmark className="w-4 h-4" />, path: '/admin/deposits' },
  { label: 'Notifications', icon: <Bell className="w-4 h-4" />, path: '/admin/notifications' },
  { label: 'Audit Log', icon: <ScrollText className="w-4 h-4" />, path: '/admin/audit-log' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, refreshUser } = useAuth()
  const { isOwner, isDriver, isAdmin } = useRole()

  const kycPassed = isKycApproved(user?.verification_status)
  const navItems = isAdmin ? adminNav : isOwner ? ownerNav(kycPassed) : isDriver ? driverNav(kycPassed) : []
  const linkedNavItems = navItems.filter((item): item is NavItem & { path: string } => Boolean(item.path))

  useEffect(() => {
    if ((isOwner || isDriver) && !kycPassed) {
      refreshUser().catch(() => {
        // Keep the current sidebar state if the session refresh fails.
      })
    }
  }, [isOwner, isDriver, kycPassed, refreshUser])

  const isNavItemActive = (itemPath: string) => {
    if (pathname === itemPath) return true

    if (itemPath === '/owner' || itemPath === '/driver' || itemPath === '/admin') {
      return false
    }

    return pathname.startsWith(`${itemPath}/`)
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border border-white/15 bg-slate-950/85 text-white shadow-lg shadow-slate-950/30 backdrop-blur-xl transition hover:bg-slate-900"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-white shadow-[24px_0_80px_rgba(2,6,23,0.35)] transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_32%),linear-gradient(180deg,#020617_0%,#081028_46%,#0f172a_100%)]" />
        <div className={cn(
          'relative flex items-center gap-3 h-16 px-4 border-b border-white/10',
          collapsed && 'justify-center px-2',
        )}>
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10 shadow-lg shadow-amber-500/10">
              <img src={Logo} alt="" className="h-8 w-auto object-contain" />
            </span>
            {!collapsed && <span className="truncate text-sm font-semibold text-white">{APP_NAME}</span>}
          </Link>
        </div>

        <ScrollArea className="relative flex-1 py-3">
          <nav className="space-y-1.5 px-2">
            {linkedNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={() =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                      isNavItemActive(item.path) && !item.locked
                        ? 'bg-amber-400/15 text-amber-200 font-medium shadow-inner shadow-amber-500/10 ring-1 ring-amber-300/20'
                        : 'text-white/65 hover:bg-white/10 hover:text-white',
                      item.locked && 'opacity-45 hover:bg-transparent hover:text-white/65',
                      collapsed && 'justify-center px-2',
                    )
                  }
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition',
                      isNavItemActive(item.path) && !item.locked
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white',
                    )}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.locked && <Lock className="w-3 h-3 ml-auto shrink-0 text-white/50" />}
                    </>
                  )}
                </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className={cn(
          'relative p-4 border-t border-white/10 flex items-center gap-3 bg-white/[0.03]',
          collapsed && 'justify-center',
        )}>
          <div className="w-9 h-9 rounded-full border border-amber-300/20 bg-amber-400/15 flex items-center justify-center text-amber-200 font-medium text-sm shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/55 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="relative hidden lg:flex items-center justify-center h-8 border-t border-white/10 text-white/45 transition hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-90')} />
        </button>
      </aside>
    </>
  )
}

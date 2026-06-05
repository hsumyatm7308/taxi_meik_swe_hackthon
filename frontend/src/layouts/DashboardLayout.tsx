import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useRole } from '@/providers'
import { RouteProgressBar } from '@/components/shared/RouteProgressBar'
import { PageTransition } from '@/components/shared/PageTransition'

export function DashboardLayout() {
  const { isAdmin } = useRole()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950">
      <RouteProgressBar />
      <ScrollRestoration />
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 text-slate-950 lg:p-6 min-w-0">
          <div className={isAdmin ? 'mx-auto w-full max-w-7xl min-w-0' : 'w-full min-w-0'}>
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useRole } from '@/providers'

export function DashboardLayout() {
  const { isAdmin } = useRole()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-64">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 text-slate-950 lg:p-6">
          <div className={isAdmin ? 'mx-auto w-full max-w-7xl' : 'w-full'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

import { Outlet, Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { APP_NAME } from '@/constants'

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_28%),linear-gradient(135deg,#020617_0%,#081028_45%,#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[-8rem] top-12 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Car className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-wide">
              {APP_NAME}
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

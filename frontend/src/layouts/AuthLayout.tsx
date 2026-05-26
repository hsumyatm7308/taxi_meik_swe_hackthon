import { Outlet, Link } from 'react-router-dom'
import { Car } from 'lucide-react'
import { APP_NAME } from '@/constants'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-blue-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Myanmar's Premier Taxi Rental Platform
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Connect car owners with verified taxi drivers. Safe, reliable, and efficient.
          </p>
          <div className="mt-8 flex gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-white/70">Cars Listed</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-white/70">Happy Drivers</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-white/70">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">{APP_NAME}</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

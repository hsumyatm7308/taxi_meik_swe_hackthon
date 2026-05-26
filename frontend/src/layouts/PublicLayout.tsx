import { Outlet, Link } from 'react-router-dom'
import { Menu, X, Car } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { APP_NAME } from '@/constants'

export function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            {APP_NAME}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/cars" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Cars</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login"><Button variant="ghost">Login</Button></Link>
            <Link to="/register"><Button>Get Started</Button></Link>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t p-4 bg-background space-y-3">
            <Link to="/cars" className="block text-sm" onClick={() => setMobileMenu(false)}>Browse Cars</Link>
            <Link to="/about" className="block text-sm" onClick={() => setMobileMenu(false)}>About</Link>
            <Link to="/contact" className="block text-sm" onClick={() => setMobileMenu(false)}>Contact</Link>
            <Link to="/faq" className="block text-sm" onClick={() => setMobileMenu(false)}>FAQ</Link>
            <div className="flex gap-3 pt-2 border-t">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Login</Button></Link>
              <Link to="/register" className="flex-1"><Button className="w-full">Register</Button></Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Car className="w-4 h-4" />
                </div>
                {APP_NAME}
              </div>
              <p className="text-sm text-muted-foreground">
                Myanmar's trusted platform for taxi car rentals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/cars" className="block hover:text-foreground">Browse Cars</Link>
                <Link to="/about" className="block hover:text-foreground">About Us</Link>
                <Link to="/contact" className="block hover:text-foreground">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/faq" className="block hover:text-foreground">FAQ</Link>
                <Link to="/terms" className="block hover:text-foreground">Terms & Conditions</Link>
                <Link to="/privacy" className="block hover:text-foreground">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>info@taxirental.mm</p>
                <p>+95 1 234 5678</p>
                <p>Yangon, Myanmar</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

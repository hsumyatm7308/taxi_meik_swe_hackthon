import { Outlet, Link, NavLink, ScrollRestoration } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";
import { useAuth } from "@/providers";
import { getDashboardPath } from "@/utils/auth";
import Logo from "@/assets/Logo.svg";
import { RouteProgressBar } from "@/components/shared/RouteProgressBar";
import { PageTransition } from "@/components/shared/PageTransition";

const publicNavItems = [
  { label: "Home", path: "/", end: true },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "FAQ", path: "/faq" },
];

export function PublicLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-[0_30px_120px_rgba(15,23,42,0.45)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-white"
          >
            <img
              src={Logo}
              alt="Taxi Meik logo"
              className="h-9 mt-2 w-auto object-contain"
            />
            {APP_NAME}
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {publicNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/15 text-amber-300 shadow-inner shadow-white/5"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link to={getDashboardPath(user.role)}>
                <Button className="bg-amber-500 text-white hover:bg-amber-500/90">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-white/70 hover:bg-white/[0.18] hover:text-white/90 "
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-amber-500 text-white hover:bg-amber-500/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label={mobileMenu ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenu}
            aria-controls="mobile-public-nav"
          >
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "tween",
              ease: [0.25, 0.1, 0.25, 1],
              duration: 0.25,
            }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileMenu(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                ease: [0.25, 0.1, 0.25, 1],
                duration: 0.25,
              }}
              className="absolute right-0 top-0 h-full w-72 bg-slate-950 border-l border-white/10 p-6 shadow-2xl"
            >
              <div className="flex justify-end mb-8">
                <button
                  type="button"
                  onClick={() => setMobileMenu(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav id="mobile-public-nav" className="space-y-2">
                {publicNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        "block rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-white/15 text-amber-300"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                      ].join(" ")
                    }
                    onClick={() => setMobileMenu(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-6 space-y-2">
                {isAuthenticated && user ? (
                  <Link to={getDashboardPath(user.role)} onClick={() => setMobileMenu(false)}>
                    <Button className="w-full bg-white text-slate-950 hover:bg-white/90 shadow-lg">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenu(false)}>
                      <Button className="w-full border border-white/20 bg-transparent mb-4 text-white hover:bg-white/10">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenu(false)}>
                      <Button className="w-full bg-white text-slate-950 hover:bg-white/90 shadow-lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RouteProgressBar />
      <ScrollRestoration />

      <main className="flex-1 flex flex-col">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <footer className="border-t border-white/20 bg-white/10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 font-bold text-lg mb-4 text-white">
                <img
                  src={Logo}
                  alt="Taxi Meik logo"
                  className="h-10 w-auto object-contain"
                />
                {APP_NAME}
              </div>
              <p className="text-sm text-white/65">
                Myanmar's trusted platform for taxi car rentals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <div className="space-y-2 text-sm text-white/65">
                <Link to="/about" className="block hover:text-white">
                  About Us
                </Link>
                <Link to="/contact" className="block hover:text-white">
                  Contact
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Support</h4>
              <div className="space-y-2 text-sm text-white/65">
                <Link to="/faq" className="block hover:text-white">
                  FAQ
                </Link>
                <Link to="/terms" className="block hover:text-white">
                  Terms & Conditions
                </Link>
                <Link to="/privacy" className="block hover:text-white">
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Contact</h4>
              <div className="space-y-2 text-sm text-white/65">
                <p>taximeikswe@gmail.com</p>
                <p>+959 699399378</p>
                <p>Yangon, Myanmar</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

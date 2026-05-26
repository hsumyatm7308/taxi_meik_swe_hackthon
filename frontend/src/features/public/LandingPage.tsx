import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Car, Users, DollarSign, CheckCircle, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-blue-900 text-white min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Myanmar's Trusted<br />
              <span className="text-secondary">Taxi Rental</span> Platform
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto">
              Connect car owners with verified taxi drivers. Safe, reliable rentals with full deposit protection and dispute resolution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 shadow-lg">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Cars Listed', icon: <Car className="w-5 h-5" /> },
              { value: '1,000+', label: 'Verified Drivers', icon: <Users className="w-5 h-5" /> },
              { value: '50+', label: 'Cities', icon: <TrendingUp className="w-5 h-5" /> },
              { value: '98%', label: 'Satisfaction', icon: <Star className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div key={stat.label} {...fadeUp} transition={{ delay: i * 0.1 }} className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple process for both car owners and taxi drivers
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Register & Verify', desc: 'Create your account and submit your documents for verification.', icon: <Shield className="w-8 h-8" /> },
              { step: '02', title: 'List or Browse', desc: 'Owners list cars, drivers browse and book verified vehicles.', icon: <Car className="w-8 h-8" /> },
              { step: '03', title: 'Rent & Earn', desc: 'Drive safely, complete inspections, and enjoy secure payments.', icon: <DollarSign className="w-8 h-8" /> },
            ].map((item, i) => (
              <motion.div key={item.step} {...fadeUp} transition={{ delay: i * 0.15 }} className="text-center p-8 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Owners */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Car className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-4">For Car Owners</h2>
              <p className="text-muted-foreground mb-6">
                List your taxi-ready cars and earn passive income. We handle verification, deposits, and dispute resolution.
              </p>
              <ul className="space-y-3">
                {[
                  'List unlimited cars',
                  'Verified drivers only',
                  'Secure deposit system',
                  'Damage protection',
                  'Weekly earnings dashboard',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?role=owner" className="mt-6 inline-block">
                <Button>Start Earning <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </motion.div>
            <motion.div {...fadeUp} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border">
              <img src="/placeholder-owner.svg" alt="Owner dashboard preview" className="rounded-xl shadow-lg w-full" />
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* For Drivers */}
      {/* <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="order-2 md:order-1 bg-gradient-to-br from-amber/5 to-amber/10 rounded-2xl p-8 border">
              <img src="/placeholder-driver.svg" alt="Driver dashboard preview" className="rounded-xl shadow-lg w-full" />
            </motion.div>
            <motion.div {...fadeUp} className="order-1 md:order-2">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 text-amber-600">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-4">For Taxi Drivers</h2>
              <p className="text-muted-foreground mb-6">
                Find verified, well-maintained taxi cars near you. Flexible rental terms with full support.
              </p>
              <ul className="space-y-3">
                {[
                  'Browse verified cars only',
                  'Flexible daily/weekly/monthly rentals',
                  'Transparent pricing',
                  'Quick booking process',
                  '24/7 support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register?role=driver" className="mt-6 inline-block">
                <Button>Start Driving <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose TaxiRental Myanmar?</h2>
            <p className="text-muted-foreground">Built for the Myanmar taxi industry</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Verified System', desc: 'Every user, car, and document is verified by our admin team.', icon: <Shield className="w-6 h-6" /> },
              { title: 'Deposit Protection', desc: 'Deposits are securely held and released only after successful completion.', icon: <DollarSign className="w-6 h-6" /> },
              { title: 'Dispute Resolution', desc: 'Fair dispute handling with admin mediation and deposit protection.', icon: <Star className="w-6 h-6" /> },
              { title: 'Inspection Process', desc: 'Pre and post-rental inspections ensure car condition accountability.', icon: <CheckCircle className="w-6 h-6" /> },
              { title: 'Multiple Payments', desc: 'Support for KBZPay, WavePay, AyaPay, CBPay, and bank transfers.', icon: <TrendingUp className="w-6 h-6" /> },
              { title: 'Local Support', desc: 'Myanmar-based support team ready to help in Burmese and English.', icon: <Users className="w-6 h-6" /> },
            ].map((feature, i) => (
              <motion.div key={feature.title} {...fadeUp} transition={{ delay: i * 0.1 }} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Join hundreds of car owners and taxi drivers across Myanmar.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register?role=owner">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 shadow-lg">
                  Register as Owner
                </Button>
              </Link>
              <Link to="/register?role=driver">
                <Button size="lg" variant="outline" className="border-white/20 text-black hover:bg-white/10 hover:text-white shadow-lg">
                  Register as Driver
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Have a question or need help? We're here for you.</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {[
          { icon: <Mail className="w-5 h-5" />, title: 'Email', value: 'info@taxirental.mm' },
          { icon: <Phone className="w-5 h-5" />, title: 'Phone', value: '+95 1 234 5678' },
          { icon: <MapPin className="w-5 h-5" />, title: 'Address', value: 'Yangon, Myanmar' },
        ].map((c) => (
          <Card key={c.title}>
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">{c.icon}</div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input placeholder="Your name" className="bg-muted/10 text-white placeholder:text-muted-foreground border-none" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input type="email" placeholder="your@email.com" className="bg-muted/10 text-white placeholder:text-muted-foreground border-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input placeholder="How can we help?" className="bg-muted/10 text-white placeholder:text-muted-foreground border-none" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <textarea className="flex min-h-[120px] w-full border-none rounded-lg border border-input bg-muted/10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Your message..." />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

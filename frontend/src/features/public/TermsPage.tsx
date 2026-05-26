import { motion } from 'framer-motion'

export function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
          <p>By using TaxiRental Myanmar, you agree to these terms and conditions.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">1. User Responsibilities</h3>
          <p>All users must provide accurate information and valid documents. Any false information may result in account suspension.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">2. Verification</h3>
          <p>Admin reserves the right to verify all users, documents, and cars. Verification status may affect platform access.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">3. Deposits & Payments</h3>
          <p>Deposits are held for the duration of the rental. Deductions may apply for damages as determined by admin review.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">4. Dispute Resolution</h3>
          <p>All disputes are mediated by platform admin. Decisions regarding deposit deductions are final.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">5. Prohibited Activities</h3>
          <p>Subletting cars, using cars for illegal activities, or misrepresenting car condition is strictly prohibited.</p>
        </div>
      </motion.div>
    </div>
  )
}

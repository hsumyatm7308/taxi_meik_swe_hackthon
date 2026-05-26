import { motion } from 'framer-motion'

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none space-y-4 text-muted-foreground">
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your data.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">1. Data We Collect</h3>
          <p>We collect personal information including name, email, phone, NRC details, and document images for verification purposes.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">2. How We Use Your Data</h3>
          <p>Your data is used for account verification, communication, transaction processing, and platform security.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">3. Data Protection</h3>
          <p>We implement security measures to protect your personal information. Data is stored securely and not shared with third parties without consent.</p>
          <h3 className="text-lg font-semibold text-foreground mt-6">4. Your Rights</h3>
          <p>You can request access to, correction of, or deletion of your personal data at any time.</p>
        </div>
      </motion.div>
    </div>
  )
}

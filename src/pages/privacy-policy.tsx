import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/auth" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
            
            <Link to="/auth" className="text-xl font-serif font-bold text-foreground">
              Isacar.dev
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: November 2, 2025
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#introduction" className="block text-sm text-primary hover:underline">1. Introduction</a>
            <a href="#information-we-collect" className="block text-sm text-primary hover:underline">2. Information We Collect</a>
            <a href="#how-we-use" className="block text-sm text-primary hover:underline">3. How We Use Your Information</a>
            <a href="#data-sharing" className="block text-sm text-primary hover:underline">4. Data Sharing and Disclosure</a>
            <a href="#data-security" className="block text-sm text-primary hover:underline">5. Data Security</a>
            <a href="#your-rights" className="block text-sm text-primary hover:underline">6. Your Rights (LGPD/GDPR)</a>
            <a href="#cookies" className="block text-sm text-primary hover:underline">7. Cookies and Tracking Technologies</a>
            <a href="#data-retention" className="block text-sm text-primary hover:underline">8. Data Retention</a>
            <a href="#international-transfers" className="block text-sm text-primary hover:underline">9. International Data Transfers</a>
            <a href="#children" className="block text-sm text-primary hover:underline">10. Children's Privacy</a>
            <a href="#updates" className="block text-sm text-primary hover:underline">11. Updates to This Policy</a>
            <a href="#contact" className="block text-sm text-primary hover:underline">12. Contact Us</a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Introduction */}
          <section id="introduction" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Welcome to ISACAR ("we," "our," or "us"). We are committed to protecting your personal information 
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our platform and services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By using ISACAR, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.1 Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect information that you voluntarily provide when using our services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email address, phone number (optional), password</li>
              <li><strong>Profile Information:</strong> Profile picture, job title, company information</li>
              <li><strong>Content:</strong> Projects, documents, comments, files you create or upload</li>
              <li><strong>Payment Information:</strong> Billing details, processed securely through third-party payment processors</li>
              <li><strong>Communications:</strong> Messages, support requests, feedback you send to us</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.2 Information Collected Automatically</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When you access our platform, we automatically collect certain information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, actions taken</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address</li>
              <li><strong>Cookies and Similar Technologies:</strong> See Section 7 for details</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">2.3 Information from Third Parties</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may receive information about you from third-party services such as authentication providers 
              (Google, GitHub), payment processors, and analytics services.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section id="how-we-use" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Delivery:</strong> To provide, maintain, and improve our platform</li>
              <li><strong>Account Management:</strong> To create and manage your account</li>
              <li><strong>Communication:</strong> To send you updates, newsletters, and support messages</li>
              <li><strong>Personalization:</strong> To customize your experience and provide relevant content</li>
              <li><strong>Analytics:</strong> To understand how users interact with our platform</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
              <li><strong>Marketing:</strong> To send promotional communications (with your consent)</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section id="data-sharing" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">4.1 Service Providers</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We work with third-party service providers who assist us in operating our platform:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Supabase (authentication and database hosting)</li>
              <li>Cloud hosting providers (Vercel, Netlify)</li>
              <li>Payment processors (Stripe)</li>
              <li>Email service providers (SendGrid, AWS SES)</li>
              <li>Analytics services (Google Analytics)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">4.2 Legal Requirements</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or government regulation, 
              or to protect our rights, property, or safety.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">4.3 Business Transfers</h3>
            <p className="text-muted-foreground leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred 
              to the acquiring entity.
            </p>
          </section>

          {/* Data Security */}
          <section id="data-security" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Encryption of data in transit (SSL/TLS) and at rest</li>
              <li>Secure password hashing using bcrypt</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure cloud infrastructure with ISO 27001 certification</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect 
              your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section id="your-rights" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights (LGPD/GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us at <strong>privacy@isacar.dev</strong>
            </p>
          </section>

          {/* Cookies */}
          <section id="cookies" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use cookies and similar tracking technologies to enhance your experience:
            </p>
            
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">7.1 Types of Cookies</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the platform to function (authentication, security)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (theme, language)</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">7.2 Managing Cookies</h3>
            <p className="text-muted-foreground leading-relaxed">
              You can control cookies through your browser settings. Note that disabling certain cookies 
              may affect the functionality of our platform.
            </p>
          </section>

          {/* Data Retention */}
          <section id="data-retention" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Active accounts: Data retained while account is active</li>
              <li>Closed accounts: Data deleted within 90 days unless required by law</li>
              <li>Backups: May be retained for up to 30 days</li>
              <li>Legal requirements: Retained as required by applicable laws</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can request deletion of your account and data at any time through your account settings 
              or by contacting us.
            </p>
          </section>

          {/* International Transfers */}
          <section id="international-transfers" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. We ensure appropriate safeguards are in place 
              to protect your data in accordance with this Privacy Policy and applicable laws, including Standard 
              Contractual Clauses approved by the European Commission.
            </p>
          </section>

          {/* Children */}
          <section id="children" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, 
              please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* Updates */}
          <section id="updates" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
              We will notify you of any material changes by posting the new policy on this page and updating the 
              "Last Updated" date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section id="contact" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-foreground font-semibold mb-2">ISACAR Technologies</p>
              <p className="text-muted-foreground mb-1">Email: <a href="mailto:privacy@isacar.dev" className="text-primary hover:underline">privacy@isacar.dev</a></p>
              <p className="text-muted-foreground mb-1">Support: <a href="mailto:support@isacar.dev" className="text-primary hover:underline">support@isacar.dev</a></p>
              <p className="text-muted-foreground">Website: <a href="https://isacar.dev" className="text-primary hover:underline">https://isacar.dev</a></p>
            </div>
          </section>
        </div>

        {/* Back to Top */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <Link 
            to="/auth"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">© 2025 ISACAR Technologies. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <span>•</span>
              <a href="mailto:support@isacar.dev" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

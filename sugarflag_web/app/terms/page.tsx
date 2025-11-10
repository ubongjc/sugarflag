export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <p className="text-muted-foreground">
          <strong>Last Updated:</strong> November 10, 2025
        </p>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SugarFlag's web application or mobile apps (the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Services.
          </p>
          <p className="mt-4">
            These Terms constitute a legally binding agreement between you and SugarFlag. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p>
            SugarFlag provides nutrition analysis services focused on sugar content and sweetener identification. Our Services include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Barcode (UPC) scanning and product lookup</li>
            <li>Nutrition label photo analysis using AI/OCR</li>
            <li>Sugar and sweetener scoring (0-100 scale)</li>
            <li>Personalized product recommendations</li>
            <li>Weekly cart suggestions with lower-sugar alternatives</li>
            <li>Scan history and analytics</li>
            <li>Affiliate links to purchase products</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Account Creation</h3>
          <p>
            To use certain features, you must create an account using passkey authentication (WebAuthn). You must:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your authentication credentials</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be at least 13 years old (or the age of majority in your jurisdiction)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Account Responsibility</h3>
          <p>
            You are responsible for all activities under your account. We are not liable for any loss or damage from your failure to maintain account security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">4. Subscriptions and Payments</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Subscription Tiers</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Free:</strong> 10 scans per month, basic features</li>
            <li><strong>Premium ($2.99/month):</strong> Unlimited scans, advanced recommendations, export features</li>
            <li><strong>Family ($6.99/month):</strong> Up to 5 users, all Premium features, priority support</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Billing</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Subscriptions are billed monthly in advance</li>
            <li>Payment is processed securely through Stripe</li>
            <li>Subscriptions auto-renew unless cancelled</li>
            <li>You can cancel anytime; cancellation takes effect at the end of the current billing period</li>
            <li>No refunds for partial months or unused features</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Price Changes</h3>
          <p>
            We reserve the right to change subscription prices with 30 days' notice. Price changes will not affect your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Services for any illegal purpose</li>
            <li>Attempt to reverse engineer, decompile, or extract source code</li>
            <li>Circumvent usage limits or access controls</li>
            <li>Scrape, crawl, or automatically collect data from the Services</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Impersonate others or provide false information</li>
            <li>Interfere with or disrupt the Services or servers</li>
            <li>Resell or redistribute the Services without authorization</li>
            <li>Use the Services to harass, abuse, or harm others</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Content and Accuracy</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Nutrition Information</h3>
          <p>
            SugarFlag provides nutrition analysis based on:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>User-uploaded photos processed by AI/OCR</li>
            <li>Third-party databases (OpenFoodFacts, manufacturer data)</li>
            <li>Algorithms and scoring models developed by SugarFlag</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.2 No Warranties</h3>
          <p className="font-semibold">
            IMPORTANT: SugarFlag does not guarantee the accuracy, completeness, or reliability of any nutrition information, scores, or recommendations.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Data may be outdated, incomplete, or incorrect</li>
            <li>OCR/AI may misread nutrition labels</li>
            <li>Product formulations change without notice</li>
            <li>Serving sizes and calculations may vary</li>
          </ul>
          <p className="mt-4">
            <strong>Always verify nutrition information with the actual product label.</strong> SugarFlag is not a substitute for professional medical or dietary advice.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Medical Disclaimer</h3>
          <p>
            SugarFlag is an informational tool, not medical advice. Consult a healthcare professional for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dietary guidance for medical conditions (diabetes, allergies, etc.)</li>
            <li>Weight loss or nutrition planning</li>
            <li>Food allergies or intolerances</li>
            <li>Any health-related concerns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Affiliate Links</h2>
          <p>
            SugarFlag may display affiliate links to products on Amazon, Walmart, Target, and other retailers. When you click these links and make purchases, we may earn a commission at no additional cost to you.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Affiliate links are clearly marked</li>
            <li>Commissions help support our free tier</li>
            <li>We are not responsible for third-party fulfillment, pricing, or quality</li>
            <li>Product availability and prices are subject to change</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Intellectual Property</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">8.1 Our Rights</h3>
          <p>
            SugarFlag owns all rights to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The SugarFlag name, logo, and branding</li>
            <li>Website and app design, code, and functionality</li>
            <li>Scoring algorithms and recommendation systems</li>
            <li>Original content, text, and graphics</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">8.2 Your Content</h3>
          <p>
            You retain ownership of photos and data you upload. By using the Services, you grant SugarFlag a worldwide, non-exclusive license to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process and analyze your uploaded content</li>
            <li>Store data necessary to provide the Services</li>
            <li>Use anonymized, aggregated data to improve the Services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">9. Third-Party Services</h2>
          <p>
            Our Services integrate with third parties:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>OpenAI:</strong> Photo OCR processing</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>OpenFoodFacts:</strong> Product database</li>
            <li><strong>PostHog:</strong> Analytics</li>
            <li><strong>Cloudflare R2:</strong> Storage</li>
          </ul>
          <p className="mt-4">
            These third parties have their own terms and privacy policies. We are not responsible for their practices or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="font-semibold">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>SUGARFLAG IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND</li>
            <li>WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
            <li>WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
            <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE PAST 12 MONTHS (OR $100, WHICHEVER IS GREATER)</li>
            <li>WE ARE NOT LIABLE FOR HEALTH OUTCOMES, DIETARY DECISIONS, OR RELIANCE ON NUTRITION DATA</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless SugarFlag from any claims, damages, or expenses (including legal fees) arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of the Services</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of others</li>
            <li>Content you upload or submit</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">12. Termination</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.1 By You</h3>
          <p>
            You may terminate your account at any time through account settings or by contacting support@sugarflag.com
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.2 By Us</h3>
          <p>
            We may suspend or terminate your account immediately if you:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Fail to pay subscription fees</li>
            <li>Abuse or misuse the Services</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">12.3 Effect of Termination</h3>
          <p>
            Upon termination:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to the Services ends immediately</li>
            <li>You may export your data before deletion (GDPR compliance)</li>
            <li>No refunds for unused subscription time</li>
            <li>Provisions regarding liability, indemnification, and disputes survive termination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">13. Dispute Resolution</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">13.1 Governing Law</h3>
          <p>
            These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">13.2 Arbitration</h3>
          <p>
            Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, except that either party may seek injunctive relief in court for intellectual property violations.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">13.3 Class Action Waiver</h3>
          <p>
            You agree to resolve disputes on an individual basis only. You waive the right to participate in class actions, class arbitrations, or representative actions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">14. Miscellaneous</h2>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and SugarFlag</li>
            <li><strong>Severability:</strong> If any provision is found unenforceable, the rest remains in effect</li>
            <li><strong>No Waiver:</strong> Failure to enforce any right does not waive that right</li>
            <li><strong>Assignment:</strong> You may not assign these Terms; we may assign them to any successor</li>
            <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">15. Contact Information</h2>
          <p>
            For questions about these Terms, contact us at:
          </p>
          <ul className="list-none space-y-1 mt-4">
            <li><strong>Email:</strong> legal@sugarflag.com</li>
            <li><strong>Support:</strong> support@sugarflag.com</li>
          </ul>
        </section>

        <section className="mt-12 p-6 bg-muted rounded-lg">
          <p className="text-sm">
            By using SugarFlag, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  )
}

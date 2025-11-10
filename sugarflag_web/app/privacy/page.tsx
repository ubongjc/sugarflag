export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <p className="text-muted-foreground">
          <strong>Last Updated:</strong> November 10, 2025
        </p>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to SugarFlag. We are committed to protecting your privacy and being transparent about how we collect, use, and share your information. This Privacy Policy explains our practices regarding your personal data when you use our web application and mobile apps (collectively, the "Services").
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Provide</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Email address, authentication credentials (passkeys)</li>
            <li><strong>Profile Data:</strong> Dietary preferences, restrictions, and dislikes</li>
            <li><strong>Scan Data:</strong> Product barcodes (UPCs), nutrition label photos, and scan results</li>
            <li><strong>Feedback:</strong> Voluntary feedback you provide about our service</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Usage Data:</strong> Pages visited, features used, scan history, and interaction patterns</li>
            <li><strong>Device Information:</strong> Device type, operating system, browser type, IP address</li>
            <li><strong>Analytics Data:</strong> We use PostHog to collect anonymized usage analytics</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Photos and Camera Access</h3>
          <p>
            When you scan nutrition labels using your camera:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Photos are encrypted on your device before transmission (iOS app)</li>
            <li>Photos are processed by OpenAI's GPT-4 Vision API to extract nutrition data</li>
            <li>Photos are not permanently stored on our servers</li>
            <li>Extracted nutrition data is saved to improve your recommendations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Provide Services:</strong> Process scans, calculate scores, generate recommendations</li>
            <li><strong>Personalization:</strong> Tailor product recommendations based on your preferences and scan history</li>
            <li><strong>Improve Services:</strong> Analyze usage patterns to enhance features and user experience</li>
            <li><strong>Communication:</strong> Send service updates, subscription confirmations, and support messages</li>
            <li><strong>Payment Processing:</strong> Process subscription payments through Stripe</li>
            <li><strong>Compliance:</strong> Meet legal obligations and enforce our Terms of Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Services</h2>
          <p>We share data with the following third-party services:</p>

          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong>OpenAI:</strong> Nutrition label photos are sent to OpenAI's GPT-4 Vision API for text extraction. See <a href="https://openai.com/policies/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener">OpenAI's Privacy Policy</a>
            </li>
            <li>
              <strong>Stripe:</strong> Payment information for subscriptions. See <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">Stripe's Privacy Policy</a>
            </li>
            <li>
              <strong>PostHog:</strong> Anonymized analytics data. See <a href="https://posthog.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">PostHog's Privacy Policy</a>
            </li>
            <li>
              <strong>Cloudflare R2:</strong> Photo storage (encrypted). See <a href="https://www.cloudflare.com/privacypolicy/" className="text-primary hover:underline" target="_blank" rel="noopener">Cloudflare's Privacy Policy</a>
            </li>
            <li>
              <strong>OpenFoodFacts:</strong> Product lookup for barcode scanning. See <a href="https://world.openfoodfacts.org/privacy" className="text-primary hover:underline" target="_blank" rel="noopener">OpenFoodFacts Privacy Policy</a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Affiliate Links and Monetization</h2>
          <p>
            SugarFlag may display affiliate links for products through partners like Amazon, Walmart, and Target. When you click these links and make purchases, we may earn a commission at no additional cost to you. These partnerships help support our free tier.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Data:</strong> Retained until you delete your account</li>
            <li><strong>Scan History:</strong> Retained for recommendation improvement unless you request deletion</li>
            <li><strong>Photos:</strong> Not permanently stored; deleted after processing</li>
            <li><strong>Analytics:</strong> Anonymized analytics retained for up to 2 years</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data (via /api/export)</li>
            <li><strong>Correction:</strong> Update your profile and preferences</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Export your data in JSON format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Withdraw Consent:</strong> Revoke permissions like camera access</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at <strong>privacy@sugarflag.com</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Children's Privacy</h2>
          <p>
            SugarFlag is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected such data, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AES-GCM-256 encryption for photos on iOS devices</li>
            <li>HTTPS/TLS for all data transmission</li>
            <li>Passkey authentication (WebAuthn/FIDO2)</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p className="mt-4">
            However, no system is 100% secure. Please use strong authentication and report any security concerns to <strong>security@sugarflag.com</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">11. California Privacy Rights (CCPA)</h2>
          <p>
            California residents have additional rights under the California Consumer Privacy Act:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to know what personal information is collected</li>
            <li>Right to know if personal information is sold or shared</li>
            <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
            <li>Right to deletion</li>
            <li>Right to non-discrimination for exercising CCPA rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">12. European Privacy Rights (GDPR)</h2>
          <p>
            If you are in the European Economic Area (EEA), UK, or Switzerland, you have rights under the General Data Protection Regulation including rights to access, rectification, erasure, restriction, portability, and objection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy with an updated "Last Updated" date. Continued use of the Services after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">14. Contact Us</h2>
          <p>
            For questions about this Privacy Policy or our privacy practices, contact us at:
          </p>
          <ul className="list-none space-y-1 mt-4">
            <li><strong>Email:</strong> privacy@sugarflag.com</li>
            <li><strong>Support:</strong> support@sugarflag.com</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

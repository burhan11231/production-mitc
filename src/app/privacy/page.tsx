'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sky-50/60 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8">

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        {/* INTRO */}
        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            MITC (Mateen IT Corp) respects your privacy and is committed to
            protecting your personal information.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and safeguard
            your data when you use our website.
          </p>
        </section>

        {/* DATA WE COLLECT */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Information We Collect
          </h2>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            <li>Name and email address</li>
            <li>Phone number (optional)</li>
            <li>Authentication provider (email/password or Google)</li>
            <li>Review content submitted by you</li>
            <li>Contact form messages</li>
            <li>Timestamps related to account activity</li>
          </ul>
        </section>

        {/* HOW WE USE */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            How We Use Your Information
          </h2>
          <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
            <li>To manage user accounts</li>
            <li>To display and moderate reviews</li>
            <li>To respond to contact inquiries</li>
            <li>To improve our services and website experience</li>
          </ul>
        </section>

        {/* THIRD PARTIES */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Third-Party Services
          </h2>
          <p className="text-sm text-gray-700">
            We use trusted third-party services such as Firebase for
            authentication and data storage, and Netlify for website hosting.
          </p>
          <p className="text-sm text-gray-700">
            These services process data according to their own privacy
            policies.
          </p>
        </section>

        {/* ACCOUNT CONTROL */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Rights & Control
          </h2>
          <p className="text-sm text-gray-700">
            You may update, deactivate, or permanently delete your account at
            any time through your profile settings.
          </p>
          <p className="text-sm text-gray-700">
            Deactivating an account disables access without deleting data.
            Permanent deletion removes your account and associated data.
          </p>
        </section>

        {/* SECURITY */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Data Security
          </h2>
          <p className="text-sm text-gray-700">
            We take reasonable technical and organizational measures to
            protect your data. However, no system is completely secure.
          </p>
        </section>

        {/* CHANGES */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Policy Updates
          </h2>
          <p className="text-sm text-gray-700">
            This Privacy Policy may be updated periodically. Continued use of
            the website indicates acceptance of the updated policy.
          </p>
        </section>

        {/* CONTACT */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Contact Us
          </h2>
          <p className="text-sm text-gray-700">
            If you have questions about this Privacy Policy, please contact
            MITC using the contact details provided on the website.
          </p>
        </section>

      </div>
    </div>
  )
}
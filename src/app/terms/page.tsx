'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sky-50/60 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8">

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </header>

        {/* INTRO */}
        <section className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>
            Welcome to <strong>MITC (Mateen IT Corp)</strong>. These Terms &
            Conditions govern your use of our website and related services.
          </p>
          <p>
            By accessing or using this website, you agree to be bound by these
            terms. If you do not agree, please do not use the website.
          </p>
        </section>

        {/* NATURE OF WEBSITE */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Nature of This Website
          </h2>
          <p className="text-sm text-gray-700">
            This website is an informational platform for our physical IT
            showroom located in Srinagar. It is intended to explain our
            services, areas of expertise, and ways to contact us.
          </p>
          <p className="text-sm text-gray-700">
            We do not offer online sales, online bookings, or inventory
            reservations through this website.
          </p>
        </section>

        {/* HARDWARE LISTING */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Hardware & Brand References
          </h2>
          <p className="text-sm text-gray-700">
            Any hardware categories or brand names displayed on the website
            represent examples of systems we commonly work with.
          </p>
          <p className="text-sm text-gray-700">
            Availability, condition, specifications, and pricing are determined
            in-store and may vary. No online listing should be considered a
            guarantee or offer.
          </p>
        </section>

        {/* SERVICES */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Services
          </h2>
          <p className="text-sm text-gray-700">
            MITC provides in-store services including laptop sales,
            diagnostics, repairs, upgrades, and professional IT support.
          </p>
          <p className="text-sm text-gray-700">
            All service decisions are made after explanation and customer
            approval at our physical location.
          </p>
        </section>

        {/* USER ACCOUNTS */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            User Accounts & Reviews
          </h2>
          <p className="text-sm text-gray-700">
            Users may create an account solely for submitting and managing a
            store review.
          </p>
          <p className="text-sm text-gray-700">
            Reviews are moderated before publication. MITC reserves the right
            to approve, reject, edit visibility, or remove reviews that violate
            guidelines or are misleading.
          </p>
        </section>

        {/* DISCLAIMER */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Disclaimer & Limitation of Liability
          </h2>
          <p className="text-sm text-gray-700">
            All information on this website is provided in good faith for
            general informational purposes only.
          </p>
          <p className="text-sm text-gray-700">
            MITC makes no warranties regarding completeness, accuracy, or
            reliability. Any reliance you place on information from this site
            is strictly at your own risk.
          </p>
          <p className="text-sm text-gray-700">
            MITC shall not be liable for any loss or damage arising from use of
            the website or reliance on its content.
          </p>
        </section>

        {/* CHANGES */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Changes to These Terms
          </h2>
          <p className="text-sm text-gray-700">
            We may update these Terms & Conditions at any time. Continued use
            of the website constitutes acceptance of the revised terms.
          </p>
        </section>

        {/* CONTACT */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Contact
          </h2>
          <p className="text-sm text-gray-700">
            For questions regarding these terms, please contact MITC through
            the contact details provided on this website.
          </p>
        </section>

      </div>
    </div>
  )
}
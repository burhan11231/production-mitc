import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MITC - Mateen IT Corp | Laptop Sales & Technical Services',
  description: 'Kashmir\'s Tech Authority Since 2013. Professional laptop sales and technical services in Srinagar.',
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-50 to-blue-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Kashmir's Tech Authority
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Since 2013, MITC has been providing professional laptop sales and technical services to businesses and individuals across Kashmir.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/contact" className="btn-primary text-lg px-8 py-3">
                Get in Touch
              </Link>
              <Link href="/services" className="btn-outline text-lg px-8 py-3">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Laptop Sales',
                description: 'Premium quality laptops from leading brands at competitive prices.',
                icon: '💻',
              },
              {
                title: 'Technical Support',
                description: 'Expert repair, maintenance, and troubleshooting services.',
                icon: '🔧',
              },
              {
                title: 'Consultation',
                description: 'Professional guidance for choosing the right technology solutions.',
                icon: '💡',
              },
            ].map((service) => (
              <div key={service.title} className="card p-8 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" className="btn-primary text-lg px-8 py-3">
              Explore All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose MITC?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Over 12 years of experience in the tech industry',
              'Trusted by hundreds of businesses and individuals',
              'Certified technicians with expertise',
              'Quality products from authorized dealers',
              'Fast and reliable service delivery',
              'Competitive pricing and transparent quotes',
            ].map((reason, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="text-primary-600 text-2xl flex-shrink-0">✓</div>
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Contact us today for a free consultation about your technology needs.
          </p>
          <Link href="/contact" className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition">
            Contact Us Now
          </Link>
        </div>
      </section>
    </>
  );
}

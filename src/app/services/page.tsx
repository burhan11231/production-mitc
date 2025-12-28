import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | MITC - Mateen IT Corp',
  description: 'Professional laptop sales, technical support, and IT consulting services in Srinagar, Kashmir.',
};

const SERVICES = [
  {
    id: 1,
    title: 'Laptop Sales',
    description: 'Premium quality laptops from leading brands including Dell, HP, Lenovo, Apple, and Asus at competitive prices.',
    icon: '🖥️',
    features: ['Latest Models', 'Authorized Dealers', 'Warranty Support', 'Flexible Payment'],
  },
  {
    id: 2,
    title: 'Hardware Repair',
    description: 'Expert repair services for laptops, desktops, and peripherals with genuine spare parts.',
    icon: '🔧',
    features: ['Screen Replacement', 'Battery Service', 'Motherboard Repair', 'Fast Turnaround'],
  },
  {
    id: 3,
    title: 'Software Solutions',
    description: 'OS installation, driver updates, antivirus setup, and performance optimization.',
    icon: '💾',
    features: ['OS Installation', 'Malware Removal', 'Performance Tuning', 'Data Recovery'],
  },
  {
    id: 4,
    title: 'Technical Consultation',
    description: 'Professional guidance for choosing the right technology solutions for your business or personal needs.',
    icon: '💡',
    features: ['System Design', 'Budget Planning', 'Compatibility Check', 'Future-Proof Solutions'],
  },
  {
    id: 5,
    title: 'Maintenance Contracts',
    description: 'Annual maintenance packages ensuring your systems run smoothly and efficiently.',
    icon: '📋',
    features: ['Regular Checkups', 'Priority Support', '24/7 Emergency', 'Discounted Parts'],
  },
  {
    id: 6,
    title: 'Data Backup & Security',
    description: 'Secure data backup solutions and cybersecurity implementation to protect your valuable information.',
    icon: '🔒',
    features: ['Cloud Backup', 'Encryption', 'Security Audit', 'Disaster Recovery'],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive technology solutions tailored to your needs. From sales to support, we've got you covered.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <div key={service.id} className="card p-8 hover:shadow-lg transition-shadow">
              <div className="text-6xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-gray-700">
                    <span className="text-primary-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Why Choose MITC?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: '12+ Years', value: 'Industry Experience' },
              { label: '1000+', value: 'Happy Customers' },
              { label: '24/7', value: 'Support Available' },
              { label: '100%', value: 'Satisfaction Guarantee' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.label}</div>
                <p className="text-gray-600">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today for a free consultation about your technology needs.
          </p>
          <a href="/contact" className="btn-primary text-lg px-8 py-3 inline-block">
            Contact Us Today
          </a>
        </div>
      </div>
    </>
  );
}

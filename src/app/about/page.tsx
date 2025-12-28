import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About MITC | Mateen IT Corp - Kashmir\'s Tech Authority',
  description: 'Learn about MITC - Kashmir\'s leading laptop sales and technical services provider since 2013.',
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About MITC</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kashmir's Tech Authority Since 2013
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-lg text-gray-700 mb-6">
              Founded in 2013, MITC (Mateen IT Corp) started as a small laptop retail shop in Srinagar with a vision to provide quality technology solutions to the people of Kashmir.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Over the years, we've grown to become Kashmir's most trusted technology partner, serving thousands of satisfied customers including individuals, small businesses, and large organizations.
            </p>
            <p className="text-lg text-gray-700">
              Today, we're proud to offer a comprehensive range of services from laptop sales to advanced technical support, all with the same passion and commitment we started with.
            </p>
          </div>
          <div className="bg-primary-100 rounded-lg h-96"></div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700">
              To provide Kashmir with reliable, high-quality technology solutions and exceptional customer service that empowers businesses and individuals to achieve their goals.
            </p>
          </div>
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-700">
              To be the most trusted and preferred technology solutions provider in Kashmir, known for quality, integrity, and customer-centric approach.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Integrity', description: 'We believe in honest dealings and transparency in all our interactions.' },
              { title: 'Quality', description: 'We never compromise on the quality of products and services we offer.' },
              { title: 'Innovation', description: 'We stay updated with the latest technology trends and solutions.' },
              { title: 'Customer First', description: 'Your satisfaction and trust are our top priorities.' },
            ].map((value) => (
              <div key={value.title} className="card p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 mb-20">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Why Choose MITC?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: '🏆', title: '12+ Years Experience', description: 'Over a decade of proven expertise in the technology industry.' },
              { icon: '👥', title: '1000+ Happy Clients', description: 'Trusted by individuals and businesses across Kashmir.' },
              { icon: '🛠️', title: 'Expert Team', description: 'Certified technicians with professional training and certifications.' },
              { icon: '📦', title: 'Authorized Dealers', description: 'Original products from authorized distributors and manufacturers.' },
              { icon: '⚡', title: 'Quick Turnaround', description: 'Fast and efficient service delivery without compromising quality.' },
              { icon: '💰', title: 'Best Prices', description: 'Competitive pricing with transparent quotes and no hidden charges.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            Our dedicated team of professionals is committed to providing you with the best technology solutions and customer service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Mateen Khan', role: 'Founder & CEO' },
              { name: 'Ahmed Ali', role: 'Technical Director' },
              { name: 'Fatima Malik', role: 'Operations Manager' },
            ].map((member) => (
              <div key={member.name} className="card p-8 text-center">
                <div className="bg-primary-100 h-24 rounded-lg mb-4"></div>
                <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience MITC?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Get in touch with our team today and discover why we're Kashmir's trusted tech partner.
          </p>
          <a href="/contact" className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-lg hover:bg-primary-50 transition">
            Contact Us
          </a>
        </div>
      </div>
    </>
  );
}

import { Link } from 'react-router-dom';
import { Scissors, Calendar, Users, Star, Play } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';
import salonImage from '../assets/images/a1.jpg';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function HomePage() {
  const { services, beautyTips } = useApp();
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const role = user?.publicMetadata?.role;

    if (role === 'admin') {
      navigate('/adminDashboard');
    } else if (role === 'staff') {
      navigate('/staffDashboard');
    } else if (role === 'customer') {
      navigate('/dashboard');
    }
  }, [isLoaded, isSignedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-8 h-8 text-purple-600" />
            <span className="text-2xl text-purple-600">Aura</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
                Your Perfect Look,<br />
                <span className="text-purple-600">Just a Click Away</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Book appointments with top stylists, manage your salon visits,<br className="hidden sm:block" />
                and discover beauty tips – all in one place.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Book Now
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard">
                    <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Book Now
                    </button>
                  </Link>
                </SignedIn>
                <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <img 
                src={salonImage} 
                alt="Aura Salon Interior" 
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Aura */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-3">Why Choose Aura?</h2>
            <p className="text-gray-600 text-lg">Experience seamless salon management</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Easy Booking */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl mb-3">Easy Booking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Schedule appointments with your preferred stylist in seconds
              </p>
            </div>

            {/* Expert Staff */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl mb-3">Expert Staff</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Choose from no-agent of professional stylists
              </p>
            </div>

            {/* Quality Service */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl mb-3">Quality Service</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Rated 4.8/5 by our satisfied customers
              </p>
            </div>

            {/* Men Salon */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl mb-3">Men Salon</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Services tailored for Men-only
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beauty Tips & Tutorials */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-3">Beauty Tips & Tutorials</h2>
            <p className="text-gray-600 text-lg">Learn from the experts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {beautyTips.map((tip) => (
              <a
                key={tip.id}
                href={tip.url || '#'}
                target={tip.url ? '_blank' : undefined}
                rel={tip.url ? 'noreferrer' : undefined}
                className={`rounded-xl overflow-hidden relative group transition-transform duration-300 ${
                  tip.url ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                <div className="aspect-video bg-black relative overflow-hidden">
                  {tip.thumbnail ? (
                    <img
                      src={tip.thumbnail}
                      alt={tip.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-800 to-black" />
                  )}
                  <div className="absolute top-3 left-3 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {tip.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-6 h-6 text-purple-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-xs text-purple-600 mb-1 uppercase tracking-wide">{tip.category}</p>
                  <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl mb-3">Our Services</h2>
            <p className="text-gray-600 text-lg">Premium services for your perfect look</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`bg-${service.color}-50 rounded-xl p-8 border border-${service.color}-100 hover:shadow-lg transition-shadow`}
              >
                <h3 className="text-2xl mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-6">
                  {service.description}
                </p>
                <p className={`text-3xl text-${service.color}-600 mb-2`}>Rs.{service.price}</p>
                <p className="text-sm text-gray-600">Duration: {service.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-6 h-6" />
                <span className="text-xl">Aura</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your perfect salon<br />
                management partner
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Hair Cut</li>
                <li className="hover:text-white cursor-pointer transition-colors">Hair Color</li>
                <li className="hover:text-white cursor-pointer transition-colors">Hair Straightening</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-lg mb-4">Hours</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Mon-Sat: 8:00 AM - 5:00 PM<br />
                Sun: Closed
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 Aura Salon Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

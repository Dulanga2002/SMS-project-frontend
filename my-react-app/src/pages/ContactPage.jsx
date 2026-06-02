import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
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

      <main className="py-10 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-8xl mx-auto mb-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <section className="bg-gradient-to-b from-purple-50 to-white rounded-3xl shadow-sm border border-purple-100">
            <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-14 lg:py-20 text-center">
              <h1 className="text-4xl lg:text-5xl font-semibold mb-6">Get in touch</h1>
              <div className="mx-auto max-w-2xl scale-[1.04] sm:scale-[1.06] origin-center rounded-2xl bg-white/90 backdrop-blur border border-gray-100 shadow-lg px-6 sm:px-10 py-8 sm:py-10">
                <div className="space-y-5 text-gray-700 text-lg">
                  <p>
                    <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Phone</strong>
                    <a href="tel:+94763251606" className="text-purple-600 hover:underline text-2xl font-semibold">
                      076 3251606
                    </a>
                  </p>
                  <p>
                    <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Email</strong>
                    <a href="mailto:dulanganikeshala2@gmail.com" className="text-purple-600 hover:underline text-2xl font-semibold">
                      dulanganikeshala2@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong className="block text-gray-900 text-sm uppercase tracking-wide mb-1">Address</strong>
                    <span className="text-xl">Moratuwa, Sri Lanka</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
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

            <div>
              <h4 className="text-lg mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer transition-colors">Hair Cut</li>
                <li className="hover:text-white cursor-pointer transition-colors">Hair Color</li>
                <li className="hover:text-white cursor-pointer transition-colors">Hair Straightening</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
                </li>
              </ul>
            </div>

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

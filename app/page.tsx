'use client';

import { Phone, MessageSquare, Calendar, Clock, MapPin, Heart } from 'lucide-react';
import VapiVoiceCall from '@/components/VapiVoiceCall';
import WebChat from '@/components/WebChat';

export default function Home() {
  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '';
  const vapiAssistantId = '365fca0e-ff6a-42a0-a944-01f1dbb552fa';

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 text-white p-4 rounded-full">
              <Heart size={48} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SanMiguel Connect AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your 24/7 healthcare assistant. Get instant answers, manage appointments, 
            and connect with care - all through chat, SMS, or voice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WebChat />
            <VapiVoiceCall publicKey={vapiPublicKey} assistantId={vapiAssistantId} />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How We Can Help
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="bg-primary-100 text-primary-600 p-3 rounded-lg w-fit mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Manage Appointments
            </h3>
            <p className="text-gray-600">
              Schedule, reschedule, or confirm appointments instantly through chat, 
              SMS, or voice. Get reminders and updates automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="bg-primary-100 text-primary-600 p-3 rounded-lg w-fit mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              24/7 Availability
            </h3>
            <p className="text-gray-600">
              Get answers to your questions anytime, day or night. Our AI assistant 
              is always ready to help with clinic information and general inquiries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="bg-primary-100 text-primary-600 p-3 rounded-lg w-fit mb-4">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Multi-Channel Support
            </h3>
            <p className="text-gray-600">
              Reach us however you prefer - web chat, SMS text messaging, or phone call. 
              We support both English and Spanish.
            </p>
          </div>
        </div>
      </div>

      {/* Clinics Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Locations
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-primary-600" />
                Downtown Clinic
              </h3>
              <p className="text-gray-600 mb-2">123 Main Street</p>
              <p className="text-gray-600 mb-4">San Miguel, CA 94000</p>
              <p className="text-sm text-gray-500 mb-2">
                <strong>Hours:</strong>
              </p>
              <p className="text-sm text-gray-600">Mon-Fri: 8:00 AM - 6:00 PM</p>
              <p className="text-sm text-gray-600">Sat: 9:00 AM - 1:00 PM</p>
              <p className="text-sm text-gray-600">Sun: Closed</p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Services:</strong> General Practice, Pediatrics, Lab Services, Vaccinations
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={24} className="text-primary-600" />
                North Clinic
              </h3>
              <p className="text-gray-600 mb-2">456 Oak Avenue</p>
              <p className="text-gray-600 mb-4">San Miguel, CA 94001</p>
              <p className="text-sm text-gray-500 mb-2">
                <strong>Hours:</strong>
              </p>
              <p className="text-sm text-gray-600">Mon-Fri: 9:00 AM - 5:00 PM</p>
              <p className="text-sm text-gray-600">Sat-Sun: Closed</p>
              <p className="text-sm text-gray-500 mt-4">
                <strong>Services:</strong> Family Medicine, Women's Health, Mental Health
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-primary-600 text-white rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Contact us by phone or text at your convenience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold">
              Text: (415) 555-1000
            </div>
            <div className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold">
              Call: (415) 555-1000
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2024 SanMiguel Connect AI. All rights reserved.</p>
          <p className="text-sm text-gray-400">
            HIPAA Compliant | Privacy Protected | Secure Communication
          </p>
        </div>
      </footer>

    </main>
  );
}

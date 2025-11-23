'use client';

import { Phone, MessageSquare, Calendar, Clock, MapPin, Heart } from 'lucide-react';
import VapiVoiceCall from '@/components/VapiVoiceCall';
import WebChat from '@/components/WebChat';
import { useState, useEffect, useRef } from 'react';
import locationsData from '@/data/us-locations.json';

export default function Home() {
  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '8ae1c1a3-57a8-459e-98fa-421403422a95';
  const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '34c63f21-7844-47b6-ba91-bca6b9512a21';

  // Form state
  const [formData, setFormData] = useState({
    country: 'USA',
    state: '',
    house: '',
    street: '',
    city: '',
    zipcode: ''
  });

  const [errors, setErrors] = useState({
    state: '',
    house: '',
    street: '',
    zipcode: ''
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [houseSuggestions, setHouseSuggestions] = useState<any[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<any[]>([]);
  const [showHouseSuggestions, setShowHouseSuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const houseInputRef = useRef<HTMLInputElement>(null);
  const streetInputRef = useRef<HTMLInputElement>(null);

  // US States
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ];

  // ZIP code to address lookup
  const zipLookup: { [key: string]: { house: string; street: string; city: string; state: string } } = {
    "75203": { house: "428", street: "E Jefferson Blvd, Suite 123", city: "Dallas", state: "Texas" },
    "75220": { house: "2731", street: "W Northwest Hwy", city: "Dallas", state: "Texas" },
    "75218": { house: "11411", street: "E NorthWest Hwy", city: "Dallas", state: "Texas" },
    "76010": { house: "787", street: "E Park Row Dr", city: "Arlington", state: "Texas" },
    "77545": { house: "12033", street: "SH-6 N", city: "Fresno", state: "Texas" },
    "77015": { house: "12741", street: "East Freeway", city: "Houston", state: "Texas" },
    "77067": { house: "11243", street: "Veterans Memorial Dr, Ste H", city: "Houston", state: "Texas" },
    "77084": { house: "4240", street: "Hwy 6 G", city: "Houston", state: "Texas" },
    "77036": { house: "5712", street: "Fondren Rd", city: "Houston", state: "Texas" },
    "77386": { house: "25538", street: "Interstate 45 N, Suite B", city: "Spring", state: "Texas" },
    "77502": { house: "2777", street: "Shaver St", city: "Pasadena", state: "Texas" },
    "78221": { house: "680", street: "SW Military Dr, Suite EF", city: "San Antonio", state: "Texas" },
    "78217": { house: "13032", street: "Nacogdoches Rd, Suite 213", city: "San Antonio", state: "Texas" },
    "78216": { house: "5525", street: "Blanco Rd, Suite 102", city: "San Antonio", state: "Texas" },
    "76114": { house: "4819", street: "River Oaks Blvd", city: "Fort Worth", state: "Texas" },
    "76115": { house: "1114", street: "East Seminary Dr", city: "Fort Worth", state: "Texas" },
    "75234": { house: "14510", street: "Josey Lane, Suite 208", city: "Farmers Branch", state: "Texas" }
  };

  // Validation functions
  const validateZipCode = (zip: string) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle ZIP code auto-fill
    if (name === 'zipcode' && value.length === 5) {
      const addressData = zipLookup[value];
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          house: addressData.house,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipcode: value
        }));
        setErrors(prev => ({
          ...prev,
          house: '',
          street: '',
          state: ''
        }));
        // Show success message
        setTimeout(() => {
          alert(`✅ Address auto-filled for ZIP ${value}!\n\n${addressData.house} ${addressData.street}\n${addressData.city}, ${addressData.state} ${value}`);
        }, 100);
      }
    }
  };

  const selectHouseSuggestion = (location: any) => {
    setFormData(prev => ({
      ...prev,
      house: location.house,
      street: location.street,
      city: location.city,
      state: location.state,
      zipcode: location.zip
    }));
    setShowHouseSuggestions(false);
    setErrors(prev => ({
      ...prev,
      house: '',
      street: '',
      state: '',
      zipcode: ''
    }));
  };

  const selectStreetSuggestion = (location: any) => {
    setFormData(prev => ({
      ...prev,
      house: location.house,
      street: location.street,
      city: location.city,
      state: location.state,
      zipcode: location.zip
    }));
    setShowStreetSuggestions(false);
    setErrors(prev => ({
      ...prev,
      house: '',
      street: '',
      state: '',
      zipcode: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      state: '',
      house: '',
      street: '',
      zipcode: ''
    };

    // Validate all fields
    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }

    if (!formData.house.trim()) {
      newErrors.house = 'House number is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street name is required';
    }

    if (!formData.zipcode.trim()) {
      newErrors.zipcode = 'ZIP code is required';
    } else if (!validateZipCode(formData.zipcode)) {
      newErrors.zipcode = 'Invalid ZIP code format (e.g., 12345 or 12345-6789)';
    }

    setErrors(newErrors);

    // If no errors, submit
    if (!Object.values(newErrors).some(error => error)) {
      alert('✅ Form submitted successfully!\n\n' + 
        `Country: ${formData.country}\n` +
        `State: ${formData.state}\n` +
        `City: ${formData.city}\n` +
        `Address: ${formData.house} ${formData.street}\n` +
        `ZIP Code: ${formData.zipcode}`
      );
      // Reset form
      setFormData({
        country: 'USA',
        state: '',
        house: '',
        street: '',
        city: '',
        zipcode: ''
      });
      // Close modal
      setIsModalOpen(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      country: 'USA',
      state: '',
      house: '',
      street: '',
      city: '',
      zipcode: ''
    });
    setErrors({
      state: '',
      house: '',
      street: '',
      zipcode: ''
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (houseInputRef.current && !houseInputRef.current.contains(event.target as Node)) {
        setShowHouseSuggestions(false);
      }
      if (streetInputRef.current && !streetInputRef.current.contains(event.target as Node)) {
        setShowStreetSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      
    <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-start items-center">
            {/* Find Location Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 text-sm" style={{backgroundColor: '#C1001F'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A00019'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C1001F'}
            >
              <MapPin size={18} />
              Find Location
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="text-white p-4 rounded-full" style={{backgroundColor: '#C1001F'}}>
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
            <VapiVoiceCall publicKey={vapiPublicKey} assistantId={vapiAssistantId} />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2" 
              style={{backgroundColor: '#C1001F'}} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A00019'} 
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C1001F'}
            >
              <MapPin size={20} />
              Find Location
            </button>
          </div>
          
          {/* Floating Chat Icon */}
          <WebChat />
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How We Can Help
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
            <div className="p-3 rounded-lg w-fit mb-4" style={{backgroundColor: '#FFE5E9', color: '#C1001F'}}>
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
            <div className="p-3 rounded-lg w-fit mb-4" style={{backgroundColor: '#FFE5E9', color: '#C1001F'}}>
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
            <div className="p-3 rounded-lg w-fit mb-4" style={{backgroundColor: '#FFE5E9', color: '#C1001F'}}>
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
                <MapPin size={24} style={{color: '#C1001F'}} />
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
                <MapPin size={24} style={{color: '#C1001F'}} />
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
        <div className="text-white rounded-2xl p-12 text-center max-w-4xl mx-auto" style={{backgroundColor: '#C1001F'}}>
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8" style={{color: '#FFE5E9'}}>
            Contact us by phone or text at your convenience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-lg font-semibold" style={{color: '#C1001F'}}>
              Text: (415) 555-1000
            </div>
            <div className="bg-white px-6 py-3 rounded-lg font-semibold" style={{color: '#C1001F'}}>
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

      {/* Location Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Find Location</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-center text-gray-600 mb-6">
                Please provide your address details
              </p>
              
              <form onSubmit={handleSubmit}>
                {/* Country Field */}
                <div className="mb-6">
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* State Dropdown */}
                <div className="mb-6">
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${ 
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a state</option>
                    {usStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                {/* House Number */}
                <div className="mb-6">
                  <label htmlFor="house" className="block text-sm font-semibold text-gray-700 mb-2">
                    House Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="house"
                    name="house"
                    value={formData.house}
                    onChange={handleInputChange}
                    placeholder="Enter house number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${ 
                      errors.house ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.house && (
                    <p className="mt-1 text-sm text-red-500">{errors.house}</p>
                  )}
                </div>

                {/* Street / Road */}
                <div className="mb-6">
                  <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
                    Street / Road <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Enter street name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${ 
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                  )}
                </div>

                {/* City (Auto-filled) */}
                <div className="mb-6">
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                {/* ZIP Code */}
                <div className="mb-6">
                  <label htmlFor="zipcode" className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    placeholder="Enter 5-digit ZIP code"
                    maxLength={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${ 
                      errors.zipcode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.zipcode && (
                    <p className="mt-1 text-sm text-red-500">{errors.zipcode}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    ⚡ Enter ZIP code to auto-fill address (17 Texas locations available)
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 text-white px-6 py-3 rounded-lg font-semibold transition-colors focus:ring-2 focus:ring-offset-2" style={{backgroundColor: '#C1001F'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A00019'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#C1001F'}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </main>
    </>
  );
}

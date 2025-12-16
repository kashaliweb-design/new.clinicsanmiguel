'use client';

import { useState, useEffect } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import {
  Settings as SettingsIcon,
  Building2,
  Phone,
  Mail,
  Clock,
  Save,
  RefreshCw,
  Key,
  Shield,
  Bell,
  Globe,
} from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: any;
  services: string[];
  timezone: string;
}

export default function SettingsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinics' | 'api' | 'notifications'>('clinics');

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLINICS)
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setClinics(data || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHours = (hours: any) => {
    if (!hours) return 'Not set';
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map((day) => {
      const time = hours[day];
      return (
        <div key={day} className="flex justify-between py-1">
          <span className="capitalize font-medium">{day}:</span>
          <span className="text-gray-600">{time || 'Closed'}</span>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage system configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 overflow-x-auto px-4">
              <button
                onClick={() => setActiveTab('clinics')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'clinics'
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Building2 size={18} />
                Clinics
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'api'
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Key size={18} />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-primary-600 text-primary-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Bell size={18} />
                Notifications
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Clinics Tab */}
            {activeTab === 'clinics' && (
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading clinics...</p>
                  </div>
                ) : clinics.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">No clinics configured</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {clinics.map((clinic) => (
                      <div key={clinic.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {clinic.name}
                            </h3>
                            <p className="text-sm text-gray-500">Clinic ID: {clinic.id}</p>
                          </div>
                          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2">
                            <Save size={16} />
                            Edit
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Contact Information */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Phone size={18} className="text-primary-600" />
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <Building2 size={16} className="text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Address</p>
                                  <p className="text-gray-600">{clinic.address}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <div>
                                  <p className="font-medium">Phone</p>
                                  <p className="text-gray-600">{clinic.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <div>
                                  <p className="font-medium">Email</p>
                                  <p className="text-gray-600">{clinic.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe size={16} className="text-gray-400" />
                                <div>
                                  <p className="font-medium">Timezone</p>
                                  <p className="text-gray-600">{clinic.timezone}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Hours */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <Clock size={18} className="text-primary-600" />
                              Operating Hours
                            </h4>
                            <div className="text-sm">{formatHours(clinic.hours)}</div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Services Offered</h4>
                          <div className="flex flex-wrap gap-2">
                            {clinic.services.map((service, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Security Notice</h4>
                      <p className="text-sm text-blue-800">
                        API keys are stored in your <code className="bg-blue-100 px-1 rounded">.env.local</code> file.
                        Never share these keys or commit them to version control.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supabase */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supabase</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project URL
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anon Key
                      </label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Vapi */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vapi AI</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Private Key
                      </label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Public Key
                      </label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Telnyx */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Telnyx</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="+1 (XXX) XXX-XXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> To update API keys, edit your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file
                    and restart the development server.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointment Reminders
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">24-Hour Reminder</p>
                        <p className="text-sm text-gray-600">
                          Send SMS reminder 24 hours before appointment
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">1-Hour Reminder</p>
                        <p className="text-sm text-gray-600">
                          Send SMS reminder 1 hour before appointment
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Admin Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">New Patient Registration</p>
                        <p className="text-sm text-gray-600">
                          Notify when a new patient registers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Appointment Requests</p>
                        <p className="text-sm text-gray-600">
                          Notify when patients request appointments
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Urgent Messages</p>
                        <p className="text-sm text-gray-600">
                          Notify for messages marked as urgent
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Save size={20} />
                  Save Notification Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

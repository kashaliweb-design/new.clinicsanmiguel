'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    loadAppointments();

    // Set up real-time subscription
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          console.log('Appointment change detected:', payload);
          // Reload appointments when any change occurs
          loadAppointments();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const loadAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select('*, patients(*), clinics(*)')
        .order('appointment_date', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-600" size={20} />;
      default:
        return <AlertCircle className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage patient appointments</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'scheduled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'confirmed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {getStatusIcon(appointment.status)}
                    {appointment.status}
                  </span>
                  <span className="text-xs text-gray-500">#{appointment.confirmation_code}</span>
                </div>

                {/* Patient Info */}
                <div className="flex items-center gap-2 mb-3">
                  <User className="text-gray-400" size={18} />
                  <span className="font-semibold text-gray-900">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                  <Calendar className="text-gray-400" size={16} />
                  <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Clock className="text-gray-400" size={16} />
                  <span>
                    {new Date(appointment.appointment_date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-gray-400">({appointment.duration_minutes} min)</span>
                </div>

                {/* Clinic */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <MapPin className="text-gray-400" size={16} />
                  <span>{appointment.clinics?.name}</span>
                </div>

                {/* Service Type */}
                {appointment.service_type && (
                  <div className="bg-gray-50 rounded px-3 py-2 text-sm text-gray-700 mb-3">
                    {appointment.service_type}
                  </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                  <div className="text-xs text-gray-500 border-t pt-3 mt-3">{appointment.notes}</div>
                )}

                {/* Contact Info */}
                <div className="border-t pt-3 mt-3">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-semibold">Phone:</span> {appointment.patients?.phone}
                  </div>
                  {appointment.patients?.email && (
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Email:</span> {appointment.patients?.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {appointments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No appointments in the system yet.'
                : `No ${filter} appointments found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Phone, Calendar, Users, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalInteractions: number;
  totalAppointments: number;
  totalPatients: number;
  todayInteractions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInteractions: 0,
    totalAppointments: 0,
    totalPatients: 0,
    todayInteractions: 0,
  });
  const [recentInteractions, setRecentInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get stats
      const [interactions, appointments, patients, todayInteractions] = await Promise.all([
        supabase.from('interactions').select('id', { count: 'exact', head: true }),
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase
          .from('interactions')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
      ]);

      setStats({
        totalInteractions: interactions.count || 0,
        totalAppointments: appointments.count || 0,
        totalPatients: patients.count || 0,
        todayInteractions: todayInteractions.count || 0,
      });

      // Get recent interactions
      const { data: recent } = await supabase
        .from('interactions')
        .select('*, patients(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentInteractions(recent || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">SanMiguel Connect AI</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalInteractions}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <MessageSquare className="text-primary-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAppointments}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPatients}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Activity</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayInteractions}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Interactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInteractions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(interaction.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {interaction.patients
                        ? `${interaction.patients.first_name} ${interaction.patients.last_name}`
                        : 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interaction.channel === 'web_chat'
                            ? 'bg-blue-100 text-blue-800'
                            : interaction.channel === 'sms'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {interaction.channel === 'web_chat' ? (
                          <MessageSquare size={12} className="mr-1" />
                        ) : interaction.channel === 'sms' ? (
                          <Phone size={12} className="mr-1" />
                        ) : (
                          <Phone size={12} className="mr-1" />
                        )}
                        {interaction.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interaction.direction === 'inbound'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-primary-100 text-primary-800'
                        }`}
                      >
                        {interaction.direction}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {interaction.message_body || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interaction.intent || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

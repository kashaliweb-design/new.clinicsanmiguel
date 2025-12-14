'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Phone, User, Calendar, Clock, Filter, RefreshCw } from 'lucide-react';

interface Interaction {
  id: string;
  patient_id: string;
  channel: 'web' | 'web_chat' | 'sms' | 'voice';
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  message_body: string;
  intent: string;
  metadata?: any;
  created_at: string;
  patient?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'web' | 'web_chat' | 'sms' | 'voice'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadInteractions();

    // Set up real-time subscription
    const channel = supabase
      .channel('interactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadInteractions();
        }
      )
      .subscribe();

    // Auto-refresh every 10 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadInteractions();
      }, 10000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, filter]);

  const loadInteractions = async () => {
    try {
      let query = supabase
        .from('interactions')
        .select(`
          *,
          patient:patients(first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('channel', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error loading interactions:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} interactions from Supabase`);
      console.log('Filter:', filter);
      console.log('Sample data:', data?.[0]);
      
      setInteractions(data || []);
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'web':
      case 'web_chat':
        return <MessageSquare className="text-blue-600" size={20} />;
      case 'sms':
        return <MessageSquare className="text-green-600" size={20} />;
      case 'voice':
        return <Phone className="text-purple-600" size={20} />;
      default:
        return <MessageSquare className="text-gray-600" size={20} />;
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors = {
      web: 'bg-blue-100 text-blue-800',
      web_chat: 'bg-blue-100 text-blue-800',
      sms: 'bg-green-100 text-green-800',
      voice: 'bg-purple-100 text-purple-800',
    };
    return colors[channel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient Interactions
          </h1>
          <p className="text-gray-600">
            Real-time view of all patient communications
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
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
                onClick={() => setFilter('web_chat')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'web_chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chatbot
              </button>
              <button
                onClick={() => setFilter('sms')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'sms'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                SMS
              </button>
              <button
                onClick={() => setFilter('voice')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'voice'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Voice
              </button>
            </div>

            {/* Auto-refresh Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadInteractions()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interactions.length}
                </p>
              </div>
              <MessageSquare className="text-gray-400" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chatbot</p>
                <p className="text-2xl font-bold text-blue-600">
                  {interactions.filter((i) => i.channel === 'web_chat').length}
                </p>
              </div>
              <MessageSquare className="text-blue-400" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SMS</p>
                <p className="text-2xl font-bold text-green-600">
                  {interactions.filter((i) => i.channel === 'sms').length}
                </p>
              </div>
              <MessageSquare className="text-green-400" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Voice</p>
                <p className="text-2xl font-bold text-purple-600">
                  {interactions.filter((i) => i.channel === 'voice').length}
                </p>
              </div>
              <Phone className="text-purple-400" size={32} />
            </div>
          </div>
        </div>

        {/* Interactions List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading interactions...</p>
            </div>
          ) : interactions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No interactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Channel Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getChannelIcon(interaction.channel)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {interaction.patient
                            ? `${interaction.patient.first_name} ${interaction.patient.last_name}`
                            : 'Unknown Patient'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getChannelBadge(
                            interaction.channel
                          )}`}
                        >
                          {interaction.channel === 'web_chat' ? 'CHATBOT' : interaction.channel.toUpperCase()}
                        </span>
                        {interaction.intent && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {interaction.intent}
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>{interaction.direction === 'inbound' ? 'Patient' : 'Assistant'}:</strong>
                        </p>
                        <p className={`text-sm text-gray-800 rounded p-2 ${
                          interaction.direction === 'inbound' ? 'bg-gray-50' : 'bg-blue-50'
                        }`}>
                          {interaction.message_body}
                        </p>
                      </div>

                      {/* Phone Numbers */}
                      {(interaction.from_number || interaction.to_number) && (
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          {interaction.from_number && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              From: {interaction.from_number}
                            </span>
                          )}
                          {interaction.to_number && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              To: {interaction.to_number}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDate(interaction.created_at)}
                        </span>
                        {interaction.patient?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {interaction.patient.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Indicator */}
        {autoRefresh && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        )}
      </div>
    </div>
  );
}

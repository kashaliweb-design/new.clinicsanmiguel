'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WebChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hello! Welcome to SanMiguel Connect AI. I\'m here to help you with appointments, clinic information, and general inquiries. How can I assist you today?',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Log interaction to database
      await supabase.from('interactions').insert({
        channel: 'web_chat',
        direction: 'inbound',
        message_body: inputMessage,
        from_number: patientPhone || null,
      });

      // Simple AI response logic (you can integrate with OpenAI later)
      const response = await generateResponse(inputMessage);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Log assistant response
      await supabase.from('interactions').insert({
        channel: 'web_chat',
        direction: 'outbound',
        message_body: response,
        to_number: patientPhone || null,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request. Please try again or call us at (415) 555-1000.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.toLowerCase();

    // Hours inquiry
    if (input.includes('hour') || input.includes('open') || input.includes('close')) {
      return 'Our clinic hours are:\n\n📍 Downtown Clinic:\nMon-Fri: 8:00 AM - 6:00 PM\nSat: 9:00 AM - 1:00 PM\nSun: Closed\n\n📍 North Clinic:\nMon-Fri: 9:00 AM - 5:00 PM\nSat-Sun: Closed\n\nIs there anything else I can help you with?';
    }

    // Appointment inquiry
    if (input.includes('appointment') || input.includes('schedule') || input.includes('book')) {
      return 'I\'d be happy to help you schedule an appointment! To get started, I\'ll need:\n\n1. Your full name\n2. Phone number\n3. Preferred date and time\n4. Type of service needed\n\nYou can also call us at (415) 555-1000 or text us to schedule. What works best for you?';
    }

    // Location inquiry
    if (input.includes('location') || input.includes('address') || input.includes('where')) {
      return 'We have two convenient locations:\n\n📍 Downtown Clinic\n123 Main Street\nSan Miguel, CA 94000\n\n📍 North Clinic\n456 Oak Avenue\nSan Miguel, CA 94001\n\nWhich location would you prefer?';
    }

    // Services inquiry
    if (input.includes('service') || input.includes('what do you') || input.includes('offer')) {
      return 'We offer a wide range of healthcare services:\n\n✓ General Practice\n✓ Pediatrics\n✓ Family Medicine\n✓ Women\'s Health\n✓ Mental Health\n✓ Lab Services\n✓ Vaccinations\n\nWhat specific service are you interested in?';
    }

    // Insurance inquiry
    if (input.includes('insurance') || input.includes('accept') || input.includes('coverage')) {
      return 'We accept most major insurance plans. For specific coverage questions, please:\n\n1. Call us at (415) 555-1000\n2. Bring your insurance card to your appointment\n3. Contact your insurance provider\n\nWould you like to schedule an appointment?';
    }

    // Language inquiry
    if (input.includes('spanish') || input.includes('español') || input.includes('habla')) {
      return '¡Sí! We have Spanish-speaking staff available. You can:\n\n✓ Request a Spanish-speaking provider\n✓ Get assistance in Spanish\n✓ Receive materials in Spanish\n\n¿Prefiere continuar en español?';
    }

    // Emergency
    if (input.includes('emergency') || input.includes('urgent') || input.includes('911')) {
      return '🚨 If this is a medical emergency, please call 911 immediately or go to the nearest emergency room.\n\nFor urgent but non-emergency care, we offer same-day appointments. Call us at (415) 555-1000.\n\nAre you experiencing a medical emergency?';
    }

    // Default response
    return 'Thank you for your message. I can help you with:\n\n✓ Clinic hours and locations\n✓ Scheduling appointments\n✓ Services we offer\n✓ Insurance questions\n✓ General information\n\nWhat would you like to know more about? Or call us at (415) 555-1000 for immediate assistance.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
      >
        <MessageSquare size={20} />
        Start Chat
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white text-primary-600 p-2 rounded-full">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">SanMiguel Connect AI</h3>
                  <p className="text-sm text-primary-100">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-primary-700 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-2xl px-4 py-3">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send • For emergencies, call 911
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

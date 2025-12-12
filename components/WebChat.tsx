'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Phone } from 'lucide-react';
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

  const [conversationState, setConversationState] = useState<string>('initial');
  const [appointmentData, setAppointmentData] = useState<any>({});

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message with Riley persona
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?',
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
        assistant_id: 'a4d4a9da-20f8-43df-9877-9ef1c22ba3bf',
      });

      // Call OpenAI API for response
      const openaiResponse = await fetch('/api/chat/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          conversationState,
          appointmentData,
        }),
      });

      const result = await openaiResponse.json();
      const response = result.message || 'I apologize, but I\'m having trouble processing your request.';

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
        assistant_id: 'a4d4a9da-20f8-43df-9877-9ef1c22ba3bf',
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Icon - Bottom Right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40"
        style={{backgroundColor: '#C1001F'}}
        aria-label="Open chat"
      >
        <MessageSquare size={28} />
      </button>

      {/* Chat Window - Small Popup Bottom Right */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] shadow-2xl rounded-2xl overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full h-full flex flex-col">
            {/* Header */}
            <div className="text-white p-3 rounded-t-2xl flex items-center justify-between" style={{backgroundColor: '#C1001F'}}>
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-full" style={{color: '#C1001F'}}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Clinica San Miguel</h3>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('tel:+14155551000', '_self')}
                  className="hover:bg-red-800 p-1.5 rounded-lg transition-colors"
                  aria-label="Call us"
                >
                  <Phone size={20} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-red-800 p-1.5 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200 rounded-bl-sm'
                      }`}
                      style={message.role === 'user' ? {backgroundColor: '#C1001F'} : {}}
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed text-left">{message.content}</p>
                      <p
                        className={`text-[10px] mt-1.5 text-left ${
                          message.role === 'user' ? 'text-red-100' : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
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
            <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors"
                  style={{backgroundColor: isLoading || !inputMessage.trim() ? '#d1d5db' : '#C1001F'}}
                  onMouseEnter={(e) => {
                    if (!isLoading && inputMessage.trim()) {
                      e.currentTarget.style.backgroundColor = '#A00019';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && inputMessage.trim()) {
                      e.currentTarget.style.backgroundColor = '#C1001F';
                    }
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

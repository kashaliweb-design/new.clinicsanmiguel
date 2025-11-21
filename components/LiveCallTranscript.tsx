'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, User, Bot, X } from 'lucide-react';

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function LiveCallTranscript() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  // Simulate live transcript (replace with actual Vapi integration)
  useEffect(() => {
    if (isCallActive) {
      // Demo: Add sample messages
      const timer = setTimeout(() => {
        addMessage('agent', 'Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isCallActive]);

  const addMessage = (speaker: 'user' | 'agent', text: string) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString(),
      speaker,
      text,
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, newMessage]);
  };

  const startCall = () => {
    setIsCallActive(true);
    setTranscript([]);
  };

  const endCall = () => {
    setIsCallActive(false);
    setTranscript([]);
  };

  if (!isCallActive) return null;

  return (
    <div
      className={`fixed ${
        isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'
      } bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300`}
    >
      {/* Header */}
      <div
        className="text-white p-4 rounded-t-2xl flex items-center justify-between"
        style={{ backgroundColor: '#C1001F' }}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full" style={{ color: '#C1001F' }}>
            <Phone size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Live Call</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs opacity-90">In Progress</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-red-800 p-1.5 rounded-lg transition-colors"
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            onClick={endCall}
            className="hover:bg-red-800 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Transcript */}
      {!isMinimized && (
        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {transcript.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.speaker === 'user'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-red-100'
                }`}
                style={
                  message.speaker === 'agent' ? { color: '#C1001F' } : {}
                }
              >
                {message.speaker === 'user' ? (
                  <User size={16} />
                ) : (
                  <Bot size={16} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 max-w-[75%] ${
                  message.speaker === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    message.speaker === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}

      {/* Call Status */}
      {!isMinimized && (
        <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>🎙️ Listening...</span>
            <span>Call Duration: 00:00</span>
          </div>
        </div>
      )}
    </div>
  );
}

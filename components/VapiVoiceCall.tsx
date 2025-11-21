'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Bot, X } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VapiVoiceCallProps {
  publicKey: string;
  assistantId?: string;
}

interface TranscriptMessage {
  id: string;
  speaker: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function VapiVoiceCall({ publicKey, assistantId }: VapiVoiceCallProps) {
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcript]);

  const addTranscriptMessage = (speaker: 'user' | 'agent', text: string) => {
    const newMessage: TranscriptMessage = {
      id: Date.now().toString() + Math.random(),
      speaker,
      text,
      timestamp: new Date(),
    };
    setTranscript((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    // Check if public key is provided
    if (!publicKey) {
      console.error('Vapi public key is missing');
      return;
    }

    try {
      // Initialize Vapi
      const vapiInstance = new Vapi(publicKey);
      setVapi(vapiInstance);
      console.log('Vapi initialized successfully');

      // Listen to call events
      vapiInstance.on('call-start', () => {
        console.log('Call started');
        setIsCallActive(true);
        setIsLoading(false);
        setCallStatus('Connected');
        setTranscript([]);
        setCallDuration(0);
        
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        // Add welcome message
        setTimeout(() => {
          addTranscriptMessage('agent', 'Thank you for calling Wellness Partners. This is Riley, your scheduling assistant. How may I help you today?');
        }, 500);
      });

      vapiInstance.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setCallStatus('');
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
      });

      vapiInstance.on('speech-start', () => {
        setCallStatus('Listening...');
      });

      vapiInstance.on('speech-end', () => {
        setCallStatus('Processing...');
      });

      // Listen for transcript messages
      vapiInstance.on('message', (message: any) => {
        console.log('Vapi message:', message);
        
        // Handle different message types
        if (message.type === 'transcript') {
          const text = message.transcriptType === 'final' ? message.transcript : null;
          if (text) {
            const speaker = message.role === 'assistant' ? 'agent' : 'user';
            addTranscriptMessage(speaker, text);
          }
        } else if (message.type === 'function-call') {
          // Handle function calls if needed
          console.log('Function call:', message);
        }
      });

      vapiInstance.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setIsCallActive(false);
        setIsLoading(false);
        setCallStatus('');
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
        
        // More detailed error message
        const errorMsg = error?.message || 'Unknown error occurred';
        console.log('Error details:', errorMsg);
        // Don't show alert, just log - call will auto-retry
      });
    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
    }

    return () => {
      if (vapi) {
        vapi.stop();
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [publicKey]);

  const startCall = async () => {
    if (!vapi) {
      alert('Voice system is loading. Please try again in a moment.');
      return;
    }

    try {
      setIsLoading(true);
      setCallStatus('Connecting...');

      // Start call with assistant ID
      if (assistantId) {
        console.log('Starting call with assistant:', assistantId);
        
        // Simple: just pass the assistant ID string
        await vapi.start(assistantId);
      } else {
        // Show message to create assistant
        alert('Please create an assistant in Vapi Dashboard first and add the Assistant ID.');
        setIsLoading(false);
        setCallStatus('');
        return;
      }
    } catch (error: any) {
      console.error('Failed to start call:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setIsLoading(false);
      setCallStatus('');
      
      // More detailed error message
      let errorMsg = 'Failed to start call';
      if (error?.error?.message) {
        errorMsg = error.error.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      console.log('Call failed with error:', errorMsg);
      // Don't show alert - just log for debugging
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
      setIsCallActive(false);
      setCallStatus('');
    }
  };

  // Show setup message if no public key
  if (!publicKey) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          disabled
          className="bg-gray-300 text-gray-500 border-2 border-gray-300 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed"
        >
          <Phone size={20} />
          Call Us
        </button>
        <p className="text-xs text-red-600">
          Setup required: Add VAPI_PUBLIC_KEY to .env.local
        </p>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        {!isCallActive ? (
          <button
            onClick={startCall}
            disabled={isLoading || !vapi}
            className="bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone size={20} />
            {isLoading ? 'Connecting...' : !vapi ? 'Loading...' : 'Call Us'}
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 animate-pulse"
          >
            <PhoneOff size={20} />
            End Call
          </button>
        )}
        
        {callStatus && (
          <p className="text-sm text-gray-600 animate-pulse">
            {callStatus}
          </p>
        )}
      </div>

      {/* Live Transcript Display */}
      {isCallActive && (
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
                <h3 className="font-semibold text-sm">Live Call Transcript</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs opacity-90">In Progress</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-red-800 p-1.5 rounded-lg transition-colors text-xl leading-none"
              >
                {isMinimized ? '□' : '−'}
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
                <span>🎙️ {callStatus || 'Connected'}</span>
                <span>Duration: {formatDuration(callDuration)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

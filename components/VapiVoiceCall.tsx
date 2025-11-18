'use client';

import { useState, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface VapiVoiceCallProps {
  publicKey: string;
  assistantId?: string;
}

export default function VapiVoiceCall({ publicKey, assistantId }: VapiVoiceCallProps) {
  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');

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
      });

      vapiInstance.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setCallStatus('');
      });

      vapiInstance.on('speech-start', () => {
        setCallStatus('Listening...');
      });

      vapiInstance.on('speech-end', () => {
        setCallStatus('Processing...');
      });

      vapiInstance.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setIsCallActive(false);
        setIsLoading(false);
        setCallStatus('');
        alert('Call failed. Please try again.');
      });
    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
    }

    return () => {
      if (vapi) {
        vapi.stop();
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

      // Start call with assistant ID (you need to create one in Vapi dashboard)
      if (assistantId) {
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
      setIsLoading(false);
      setCallStatus('');
      
      const errorMsg = error?.error?.message || error?.message || 'Failed to start call';
      alert(`Call failed: ${errorMsg}\n\nPlease:\n1. Create an assistant in Vapi Dashboard\n2. Add Assistant ID to the component`);
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

  return (
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
  );
}

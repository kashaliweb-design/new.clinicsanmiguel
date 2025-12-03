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

  const clinicOptions = [
    { label: "Schedule a consultation ($19)", key: "consultation" },
    { label: "Speak with a nurse", key: "nurse" },
    { label: "View lab results", key: "lab_results" },
    { label: "General questions", key: "general" },
    { label: "Immigration medical exam ($220)", key: "immigration" },
    { label: "Find a clinic by ZIP code", key: "find_clinic" }
  ];

  const appointmentTypes = [
    { label: "Primary Care (30-60 min)", key: "primary_care" },
    { label: "Specialist Consultation (45-60 min)", key: "specialist" },
    { label: "Diagnostic Services (15-90 min)", key: "diagnostic" },
    { label: "Wellness Services (45-60 min)", key: "wellness" },
    { label: "Urgent Care (30 min)", key: "urgent_care" }
  ];

  const zipLookup: { [key: string]: string } = {
    "75203": "428 E Jefferson Blvd, Suite 123, Dallas, TX 75203",
    "75220": "2731 W Northwest Hwy, Dallas, TX 75220",
    "75218": "11411 E NorthWest Hwy, Dallas, TX 75218",
    "76010": "787 E Park Row Dr, Arlington, TX 76010",
    "77545": "12033 SH-6 N, Fresno, TX 77545",
    "77015": "12741 East Freeway, Houston, TX 77015",
    "77067": "11243 Veterans Memorial Dr, Ste H, Houston, TX 77067",
    "77084": "4240 Hwy 6 G, Houston, TX 77084",
    "77036": "5712 Fondren Rd, Houston, TX 77036",
    "77386": "25538 Interstate 45 N, Suite B, Spring, TX 77386",
    "77502": "2777 Shaver St, Pasadena, TX 77502",
    "78221": "680 SW Military Dr, Suite EF, San Antonio, TX 78221",
    "78217": "13032 Nacogdoches Rd, Suite 213, San Antonio, TX 78217",
    "78216": "5525 Blanco Rd, Suite 102, San Antonio, TX 78216",
    "76114": "4819 River Oaks Blvd, Fort Worth, TX 76114",
    "76115": "1114 East Seminary Dr, Fort Worth, TX 76115",
    "75234": "14510 Josey Lane, Suite 208, Farmers Branch, TX 75234"
  };

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

  const handleOptionClick = (optionKey: string) => {
    let response = '';
    
    switch(optionKey) {
      case 'consultation':
        response = 'The consultation costs $19. We do not accept medical insurance, but our prices are very affordable.\n\nWould you like to schedule an appointment?';
        setConversationState('ask_schedule');
        break;
      case 'nurse':
        response = 'You can speak with a nurse. Please wait while we connect your consultation.\n\nIn the meantime, could you briefly describe your concern?';
        setConversationState('nurse_concern');
        break;
      case 'lab_results':
        response = 'To view your lab results, please provide your patient number or full name.';
        setConversationState('lab_results_verify');
        break;
      case 'general':
        response = 'You may ask any general questions about our services, hours, or procedures.\n\nWhat would you like to know?';
        setConversationState('general_questions');
        break;
      case 'immigration':
        response = 'The immigration medical exam costs $220 and includes the physical exam, blood tests, and the I-693 form. Vaccines are not included; we will refer you to a nearby health center to obtain them at a lower cost.\n\nWould you like to schedule this appointment?';
        setConversationState('immigration_schedule');
        break;
      case 'find_clinic':
        response = 'Please enter your ZIP code to find the nearest clinic.';
        setConversationState('find_clinic');
        break;
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const generateResponse = async (userInput: string): Promise<string> => {
    const input = userInput.trim().toLowerCase();
    
    // Handle conversation states
    switch(conversationState) {
      case 'find_clinic':
        if (/^\d{5}$/.test(userInput.trim())) {
          const address = zipLookup[userInput.trim()];
          if (address) {
            setConversationState('initial');
            return `📍 Nearest Clinic:\n\n${address}\n\nOur hours are Monday-Friday 8am-5pm, Saturday 9am-12pm. Would you like to schedule an appointment?`;
          } else {
            return 'Sorry, we do not have a clinic in that ZIP code. Please search on your map for the nearest Clinica San Miguel, or try another ZIP code.';
          }
        }
        return 'Please enter a valid 5-digit ZIP code.';

      case 'ask_schedule':
        if (input.includes('yes') || input.includes('schedule')) {
          setConversationState('ask_new_patient');
          return 'Great! Have you visited our clinic before, or will this be your first appointment with us?';
        }
        setConversationState('initial');
        return 'No problem. If you have any other questions, feel free to ask. How else can I help you today?';

      case 'nurse_concern':
        setConversationState('initial');
        return 'Thank you for sharing that. A nurse will be with you shortly to discuss your concern. Is there anything else I can help you with while you wait?';

      case 'general_questions':
        setConversationState('initial');
        return 'I\'m here to help! You can ask about:\n\n• Clinic hours and locations\n• Services we offer\n• Insurance and payment\n• Appointment scheduling\n\nWhat would you like to know?';

      case 'ask_new_patient':
        if (input.includes('new') || input.includes('first')) {
          setConversationState('collect_new_patient_info');
          return 'Great! Since this is your first visit, I\'ll need to collect some basic information. Please provide your full name, date of birth (MM/DD/YYYY), age, phone number, and address.';
        } else if (input.includes('return') || input.includes('been') || input.includes('yes')) {
          setConversationState('collect_returning_patient_info');
          return 'Welcome back! To access your record, may I have your full name, date of birth, and phone number?';
        }
        return 'Please let me know if this is your first visit or if you\'ve been to our clinic before.';

      case 'collect_new_patient_info':
        setAppointmentData({ ...appointmentData, patientInfo: userInput });
        setConversationState('ask_appointment_type');
        return 'Thank you. Now, what type of appointment are you looking to schedule today? We offer:\n\n• Primary Care (30-60 min)\n• Specialist Consultation (45-60 min)\n• Diagnostic Services (15-90 min)\n• Wellness Services (45-60 min)\n• Urgent Care (30 min)';

      case 'collect_returning_patient_info':
        setAppointmentData({ ...appointmentData, patientInfo: userInput });
        setConversationState('ask_appointment_type');
        return 'Thank you for verifying your information. What type of appointment would you like to schedule?';

      case 'ask_appointment_type':
        setAppointmentData({ ...appointmentData, appointmentType: userInput });
        setConversationState('ask_provider_preference');
        return 'Do you have a specific provider you\'d like to see, or would you prefer the first available appointment?';

      case 'ask_provider_preference':
        setAppointmentData({ ...appointmentData, providerPreference: userInput });
        setConversationState('offer_times');
        return 'Let me check our availability for you. Just a moment...\n\nI have availability on:\n• Monday, January 15th at 2:30 PM\n• Wednesday, January 17th at 10:00 AM\n• Friday, January 19th at 3:45 PM\n\nWould any of these times work for you?';

      case 'offer_times':
        setAppointmentData({ ...appointmentData, selectedTime: userInput });
        setConversationState('confirm_appointment');
        return `Great! I've reserved your appointment. To confirm:\n\nYou're scheduled for ${appointmentData.appointmentType || 'an appointment'} on ${userInput}.\n\nPlease arrive 15 minutes early to complete any necessary paperwork. Bring your insurance card and photo ID.\n\nWould you like to receive a reminder call or text message before your appointment?`;

      case 'confirm_appointment':
        setConversationState('initial');
        const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `Perfect! Your appointment is confirmed.\n\nConfirmation Code: ${confirmationCode}\n\nYou'll receive a confirmation via text/email shortly. Thank you for scheduling with Wellness Partners. Is there anything else I can help you with today?`;

      case 'immigration_schedule':
        if (input.includes('yes') || input.includes('schedule')) {
          setConversationState('collect_new_patient_info');
          return 'Excellent. I\'ll need to collect some information to schedule your immigration medical exam. Please provide your full name, date of birth, phone number, and address.';
        }
        setConversationState('initial');
        return 'No problem. If you have any other questions about the immigration medical exam, feel free to ask. How else can I help you today?';

      default:
        // General responses
        if (input.includes('hour') || input.includes('open') || input.includes('time')) {
          return 'Our clinic hours are:\n\nMonday-Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 12:00 PM\nSunday: Closed\n\nSpecialist hours may vary. Would you like to schedule an appointment?';
        }

        if (input.includes('insurance') || input.includes('coverage')) {
          return 'Wellness Partners accepts most major insurance plans including Medicare, Medicaid, Blue Cross, Aetna, UnitedHealthcare, and Cigna. For specific coverage questions, please contact your insurance provider. We collect copayments at the time of service.';
        }

        if (input.includes('cost') || input.includes('price') || input.includes('pay')) {
          return 'Consultation costs $19 for self-pay patients. Immigration medical exams are $220. Other services vary by type. We accept cash, credit cards, and most insurance plans. Would you like to schedule an appointment?';
        }

        if (input.includes('emergency') || input.includes('urgent')) {
          return '🚨 If this is a medical emergency, please call 911 immediately or go to the nearest emergency room.\n\nFor urgent but non-emergency care, we offer same-day appointments. Would you like me to check for urgent care availability?';
        }

        return 'Thank you for your message. I can help you with scheduling appointments, rescheduling, cancellations, or general questions about our services. How may I assist you today?';
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
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 ${
                        message.role === 'user'
                          ? 'text-white'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      }`}
                      style={message.role === 'user' ? {backgroundColor: '#C1001F'} : {}}
                    >
                      <p className="whitespace-pre-line text-xs leading-relaxed">{message.content}</p>
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
                  
                  {/* Show options after first message */}
                  {index === 0 && message.role === 'assistant' && (
                    <div className="mt-2 space-y-1.5">
                      {clinicOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => handleOptionClick(option.key)}
                          className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50 rounded-lg transition-all text-xs font-medium text-gray-700 hover:text-red-700"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
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

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Gamepad2,
  Bell,
  Heart,
  Globe,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { speakText, stopSpeech } from '../../utils/speech';
import { assistantApi } from '../../services/api';
import { ActivityType } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  spokenText?: string;
  timestamp: string;
  actionExecuted?: string;
}

interface AiVoiceCompanionProps {
  onStartActivity?: (type: ActivityType) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenPortal?: () => void;
  currentTab?: string;
}

export const AiVoiceCompanion: React.FC<AiVoiceCompanionProps> = ({
  onStartActivity,
  onNavigateTab,
  onOpenPortal,
  currentTab = 'home',
}) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguageStore();
  const { elderlyMode, toggleElderlyMode } = useAccessibilityStore();
  const { selectedPatient } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message localized
  const getInitialMessage = (): string => {
    switch (currentLanguage) {
      case 'hi':
        return `नमस्ते ${selectedPatient.name}! 🙏 मैं आपकी स्मृति-सेतु साथी हूँ। आप बोलकर या लिखकर "गेम खोलो", "दवाई रिमाइंडर", या "यादें दिखाओ" कह सकते हैं!`;
      case 'as':
        return `নমস্কাৰ ${selectedPatient.name}! 🙏 মই আপোনাৰ স্মৃতি-সেতু সহায়ক। আপুনি "খেল আৰম্ভ কৰক", "দৰবৰ সোঁৱৰণি", বা "স্মৃতি উদ্যান" ক'ব পাৰে!`;
      case 'bn':
        return `নমস্কার ${selectedPatient.name}! 🙏 আমি আপনার স্মৃতি-সেতু সহকারী। আপনি "খেলা শুরু করো", "ওষুধের রিমাইন্ডার" বলতে পারেন!`;
      default:
        return `Hello ${selectedPatient.name}! 🙏 I am your Smriti-Setu AI Companion. Try saying "Open game", "Show reminders", or "Open memories"!`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getInitialMessage(),
      spokenText: getInitialMessage(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update initial welcome when language changes
  useEffect(() => {
    const welcome = getInitialMessage();
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [
          {
            id: 'init-1',
            sender: 'assistant',
            text: welcome,
            spokenText: welcome,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Set language based on active language
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        en: 'en-IN',
        as: 'as-IN',
        bn: 'bn-IN',
        ne: 'ne-NP',
        brx: 'hi-IN',
      };
      recognition.lang = langMap[currentLanguage] || 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeech();
      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        en: 'en-IN',
        as: 'as-IN',
        bn: 'bn-IN',
        ne: 'ne-NP',
        brx: 'hi-IN',
      };
      recognitionRef.current.lang = langMap[currentLanguage] || 'hi-IN';
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Failed to start speech recognition:', err);
      }
    }
  };

  const executeAction = (action: { type: string; payload?: string }) => {
    if (!action || action.type === 'NONE') return null;

    let alertDesc = '';

    switch (action.type) {
      case 'OPEN_ACTIVITY': {
        const actType = (action.payload as ActivityType) || 'memory_match';
        if (onStartActivity) {
          onStartActivity(actType);
          alertDesc = `🎮 Opening Game (${actType.replace('_', ' ')})`;
        }
        break;
      }
      case 'OPEN_TAB': {
        const tab = action.payload || 'home';
        if (onNavigateTab) {
          onNavigateTab(tab);
          alertDesc = `📂 Navigating to ${tab.toUpperCase()}`;
        }
        break;
      }
      case 'TOGGLE_ELDERLY': {
        toggleElderlyMode();
        alertDesc = `👓 Elderly Accessibility Mode Toggled`;
        break;
      }
      case 'CHANGE_LANGUAGE': {
        if (action.payload) {
          setLanguage(action.payload as SupportedLanguage);
          alertDesc = `🌐 Language Switched to ${action.payload.toUpperCase()}`;
        }
        break;
      }
      case 'OPEN_PORTAL': {
        if (onOpenPortal) {
          onOpenPortal();
          alertDesc = `🏛️ Opening Public Government Health Portal`;
        }
        break;
      }
    }

    if (alertDesc) {
      setActionAlert(alertDesc);
      setTimeout(() => setActionAlert(null), 4000);
    }

    return alertDesc;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    setInputText('');
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call Backend AI Assistant API
      const res = await assistantApi.chat({
        message: query,
        language: currentLanguage,
        patientId: selectedPatient.id,
        currentTab,
      });

      const actionDesc = executeAction(res.action);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        spokenText: res.spokenText || res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: actionDesc || undefined,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak response aloud in native language
      if (speechEnabled) {
        speakText(res.spokenText || res.reply, res.detectedLanguage || currentLanguage);
      }
    } catch (err) {
      console.error('Assistant API call failed, falling back to local handler:', err);
      // Robust Local Fallback intent logic
      const norm = query.toLowerCase();
      let reply = '';
      let spoken = '';
      let executedDesc = '';

      if (norm.includes('game') || norm.includes('play') || norm.includes('खेल') || norm.includes('गेम') || norm.includes('খেল')) {
        if (onStartActivity) onStartActivity('memory_match');
        reply = 'ज़रूर! मैं आपके लिए स्मृति मिलान (Memory Match) गेम खोल रही हूँ। चलिए खेलते हैं! 🎮';
        spoken = 'ज़रूर! मैं आपके लिए खेल शुरू कर रही हूँ।';
        executedDesc = '🎮 Opened Memory Match Game';
      } else if (norm.includes('reminder') || norm.includes('दवाई') || norm.includes('दवा') || norm.includes('रिमाइंडर')) {
        if (onNavigateTab) onNavigateTab('reminders');
        reply = 'यहाँ आपके आज के दैनिक स्मरण और दवाइयाँ हैं। ⏰';
        spoken = 'यहाँ आपके आज के दैनिक स्मरण और दवाइयाँ हैं।';
        executedDesc = '⏰ Navigated to Daily Reminders';
      } else if (norm.includes('memory') || norm.includes('याद') || norm.includes('स्मृति')) {
        if (onNavigateTab) onNavigateTab('memories');
        reply = 'स्मृति उद्यान खोला गया है! यहाँ आपकी पारिवारिक यादें हैं। 🌸';
        spoken = 'स्मृति उद्यान खोला गया है।';
        executedDesc = '🌸 Navigated to Memory Garden';
      } else {
        reply = `मैंने आपकी बात समझ ली: "${query}". आप "गेम खोलो", "दवाई दिखाओ" या "यादें दिखाओ" बोल सकते हैं!`;
        spoken = 'मैंने आपकी बात समझ ली। आप गेम खेलने या दवाई देखने के लिए कह सकते हैं।';
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        spokenText: spoken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: executedDesc || undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (speechEnabled) speakText(spoken, currentLanguage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <>
      {/* Floating Action Banner Notification */}
      {actionAlert && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-emerald-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          <span className="font-extrabold text-sm sm:text-base">{actionAlert}</span>
        </div>
      )}

      {/* Floating Trigger Button (Always visible on bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-amber-300 text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{currentLanguage === 'hi' ? 'स्मृति साथी से बात करें' : 'AI Companion'}</span>
          </div>

          <button
            id="open-ai-companion-btn"
            onClick={() => {
              setIsOpen(true);
              stopSpeech();
            }}
            className="group relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#004085] via-blue-700 to-amber-500 text-white shadow-2xl hover:scale-105 transition-all duration-300 border-4 border-white focus:outline-none focus:ring-4 focus:ring-amber-400"
            title="Open Voice Chat Companion"
          >
            <Sparkles className="w-8 h-8 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 bg-amber-400 text-[#004085] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              AI
            </div>
          </button>
        </div>
      )}

      {/* Full Chatbot & Voice Assistant Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[440px] max-h-[85vh] h-[640px] bg-white rounded-3xl shadow-2xl border-2 border-slate-300 flex flex-col overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#004085] via-blue-900 to-[#07243C] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Heart className="w-6 h-6 fill-amber-400 stroke-[#004085]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                    {currentLanguage === 'hi' ? 'स्मृति-सेतु AI साथी' : 'Smriti AI Companion'}
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {currentLanguage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  {currentLanguage === 'hi'
                    ? 'हिंदी और क्षेत्रीय भाषा में बात करें या गेम शुरू करें'
                    : 'Native Voice & Direct Action Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled) stopSpeech();
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  speechEnabled
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-slate-700/60 text-slate-400 hover:text-white'
                }`}
                title={speechEnabled ? 'Voice Audio Enabled' : 'Voice Audio Muted'}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  stopSpeech();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Direct Actions Toolbar */}
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            <button
              onClick={() => handleQuickAction('खेल शुरू करो')}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-700 border border-slate-300 hover:border-amber-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shadow-2xs transition-all"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentLanguage === 'hi' ? 'गेम खेलें (Play)' : 'Open Game'}</span>
            </button>

            <button
              onClick={() => handleQuickAction('दवाई का समय')}
              className="px-3 py-1.5 bg-white hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shadow-2xs transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentLanguage === 'hi' ? 'दवाई रिमाइंडर' : 'Reminders'}</span>
            </button>

            <button
              onClick={() => handleQuickAction('यादें दिखाओ')}
              className="px-3 py-1.5 bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-700 border border-slate-300 hover:border-purple-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shadow-2xs transition-all"
            >
              <Heart className="w-3.5 h-3.5 text-purple-600" />
              <span>{currentLanguage === 'hi' ? 'स्मृति उद्यान' : 'Memories'}</span>
            </button>

            <button
              onClick={() => handleQuickAction('हिंदी में बात करो')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-300 hover:border-emerald-400 rounded-full text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shadow-2xs transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>हिंदी (Hindi)</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isBot
                        ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                        : 'bg-[#004085] text-white rounded-tr-xs'
                    }`}
                  >
                    <p
                      className={`leading-relaxed whitespace-pre-line font-medium ${
                        elderlyMode ? 'text-base font-bold' : 'text-sm'
                      }`}
                    >
                      {msg.text}
                    </p>

                    {/* Action Executed Badge */}
                    {msg.actionExecuted && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Action: {msg.actionExecuted}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 font-semibold">
                    <span>{msg.timestamp}</span>
                    {isBot && msg.spokenText && (
                      <button
                        onClick={() => speakText(msg.spokenText!, currentLanguage)}
                        className="hover:text-amber-600 flex items-center gap-1 underline"
                        title="Replay Voice"
                      >
                        <Volume2 className="w-3 h-3" /> सुनें (Listen)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl max-w-[60%] border border-slate-200 text-slate-500 text-xs font-bold animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>सोच रही हूँ... (Thinking...)</span>
              </div>
            )}

            {isListening && (
              <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-800 text-xs font-extrabold animate-pulse">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span>सुन रही हूँ... अपनी भाषा में बोलें (Listening...)</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white ring-4 ring-red-300 animate-pulse'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                }`}
                title={isListening ? 'Stop Listening' : 'Tap to Speak (Voice Input)'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  currentLanguage === 'hi'
                    ? 'यहाँ लिखें (जैसे: गेम खोलो, दवाई, यादें)...'
                    : 'Type or say: "open game", "reminders"...'
                }
                className="flex-1 px-4 py-3 bg-slate-100 border border-slate-300 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004085] focus:bg-white transition-all text-slate-900"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="p-3 rounded-2xl bg-[#004085] hover:bg-blue-800 disabled:opacity-40 text-white font-bold transition-all shadow-md flex items-center justify-center"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 font-bold mt-1.5">
              🎤 माइक दबाकर बोलें या लिखें: "खेल खोलो", "दवाई दिखाओ", "यादें", "हिंदी में बात करो"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiVoiceCompanion;

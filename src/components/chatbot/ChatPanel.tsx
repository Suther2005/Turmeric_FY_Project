import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { ChatAppContext, ChatMessage, ChatStarter } from './types';
import { streamChatMessage } from './chatService';

const STARTER_PROMPTS: { en: ChatStarter[]; ta: ChatStarter[] } = {
  en: [
    {
      id: 'starter_turmeric',
      label: '🌱 What is turmeric?',
      query: 'What is turmeric?',
    },
    {
      id: 'starter_spot',
      label: '🍃 What is Leaf Spot?',
      query: 'What is Leaf Spot?',
    },
    {
      id: 'starter_weather',
      label: '🌦️ Why does weather matter?',
      query: 'Why does weather matter for turmeric disease?',
    },
    {
      id: 'starter_scan_result',
      label: '📷 Explain my scan result',
      query: 'Why did my scan show this result?',
    },
  ],
  ta: [
    {
      id: 'starter_turmeric_ta',
      label: '🌱 மஞ்சள் என்றால் என்ன?',
      query: 'மஞ்சள் என்றால் என்ன?',
    },
    {
      id: 'starter_spot_ta',
      label: '🍃 இலைப்புள்ளி நோய் என்றால் என்ன?',
      query: 'இலைப்புள்ளி நோய் என்றால் என்ன?',
    },
    {
      id: 'starter_weather_ta',
      label: '🌦️ வானிலை ஏன் முக்கியம்?',
      query: 'மஞ்சள் பயிருக்கு வானிலை ஏன் முக்கியம்?',
    },
    {
      id: 'starter_scan_result_ta',
      label: '📷 எனது ஸ்கேன் முடிவு என்ன?',
      query: 'எனது ஸ்கேன் முடிவு ஏன் இப்படி வந்தது?',
    },
  ],
};

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ta';
  onToggleLanguage: (lang: 'en' | 'ta') => void;
  appContext?: ChatAppContext;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  appContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('curcuma_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse chat session', e);
    }
    return [];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Persist messages to session
  useEffect(() => {
    try {
      sessionStorage.setItem('curcuma_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat session', e);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-user',
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    const botMsgId = 'msg-' + (Date.now() + 1) + '-bot';
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      sender: 'bot',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      category: 'general',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages([...updatedHistory, initialBotMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      await streamChatMessage(
        text,
        updatedHistory,
        language,
        appContext,
        (accumulatedText) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId ? { ...msg, text: accumulatedText } : msg
            )
          );
        },
        (finalResponse) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    text: finalResponse.reply,
                    category: (finalResponse.category as ChatMessage['category']) || 'general',
                    suggestedFollowUps: finalResponse.suggested_follow_ups,
                  }
                : msg
            )
          );
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                text:
                  language === 'ta'
                    ? '🌱 என்னால் தற்போது பதிலளிக்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
                    : "🌱 I'm temporarily unable to generate an answer. Please try again in a moment.",
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem('curcuma_chat_history');
    } catch (e) {
      console.warn('Failed to clear chat session', e);
    }
  };

  const starters = STARTER_PROMPTS[language] || STARTER_PROMPTS.en;

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] md:w-[460px] h-[550px] max-h-[calc(100vh-6rem)] bg-white/95 backdrop-blur-xl border border-emerald-500/20 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 print:hidden font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Ask Curcuma Generative Support Chat"
    >
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-emerald-700/50 shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
              <Bot className="w-4 h-4 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-emerald-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white tracking-wide">
                Ask Curcuma
              </h3>
            </div>
            <p className="text-[11px] text-emerald-200/90 font-medium">
              {language === 'ta' ? 'மஞ்சள் பயிர் ஆதரவு' : 'Turmeric Crop Support'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Language Toggle */}
          <button
            onClick={() => onToggleLanguage(language === 'en' ? 'ta' : 'en')}
            title={language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/40 transition-colors"
          >
            {language === 'en' ? 'தமிழ்' : 'English'}
          </button>

          {/* Reset / Clear */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title={language === 'ta' ? 'அரட்டையை அழிக்க' : 'Clear conversation'}
              className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            title={language === 'ta' ? 'மூடு' : 'Close'}
            className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Area */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/80 text-xs sm:text-sm">
        {/* Empty State Welcome Banner */}
        {messages.length === 0 && (
          <div className="space-y-3.5 my-auto py-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 text-slate-800 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-950 text-xs sm:text-sm">
                    {language === 'ta' ? 'வணக்கம்! நான் Ask Curcuma' : 'Ask Curcuma Assistant'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {language === 'ta'
                      ? 'மஞ்சள் பயிர் நலம், இலை நோய்கள், வானிலை அபாயம் அல்லது உங்கள் ஸ்கேன் முடிவுகள் குறித்து இயல்பான தமிழில் என்னிடம் கேளுங்கள்.'
                      : 'Ask natural questions about turmeric crop care, disease symptoms, weather risk, or your latest scan results.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Starters */}
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-600" />
                {language === 'ta' ? 'மாதிரி கேள்விகள்:' : 'Starter Prompts:'}
              </p>
              <div className="flex flex-col gap-1">
                {starters.map((starter) => (
                  <button
                    key={starter.id}
                    onClick={() => handleSendMessage(starter.query)}
                    className="text-left px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 shadow-xs text-xs font-medium transition-all flex items-center justify-between group"
                  >
                    <span>{starter.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-1.5 max-w-[94%] sm:max-w-[88%]">
              {msg.sender === 'bot' && (
                <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[9px] shrink-0 mb-1 shadow-xs">
                  <Bot className="w-3 h-3" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl shadow-xs text-xs sm:text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-xs font-normal'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                }`}
              >
                {/* Formatted Text Content */}
                <div className="whitespace-pre-line space-y-1">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={idx} className="my-0.5">
                          {parts.map((part, pIdx) =>
                            pIdx % 2 === 1 ? (
                              <strong key={pIdx} className="font-semibold text-emerald-950">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    }
                    return line ? <p key={idx} className="my-0.5">{line}</p> : <div key={idx} className="h-1" />;
                  })}
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <span className="text-[9px] text-slate-400 mt-0.5 px-1">
              {msg.timestamp}
            </span>

            {/* Follow-up Suggestion Chips */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1 max-w-[95%]">
                {msg.suggestedFollowUps.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-full transition-colors flex items-center gap-1"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-2.5 h-2.5 text-emerald-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing / Generating Indicator */}
        {isTyping && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[9px] shadow-xs">
              <Bot className="w-3 h-3" />
            </div>
            <div className="px-3 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Footer Input Area */}
      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200/80 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'மஞ்சள் பயிர் பற்றி ஏதேனும் கேளுங்கள்...'
                  : 'Ask anything about turmeric, diseases, scan...'
              }
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isTyping}
            className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400 px-1">
          <span>{language === 'ta' ? 'முடிவு ஆதரவு வழிகாட்டுதல் மட்டுமே' : 'Decision-support advisory only'}</span>
          <span>{language === 'ta' ? 'மஞ்சள் பயிர் நலம்' : 'Turmeric Crop Care'}</span>
        </div>
      </div>
    </div>
  );
};

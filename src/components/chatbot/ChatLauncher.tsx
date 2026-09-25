import React from 'react';
import { Sparkles, MessageCircle, X, Bot } from 'lucide-react';

interface ChatLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  language: 'en' | 'ta';
  unreadCount?: number;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({
  isOpen,
  onToggle,
  language,
  unreadCount = 0,
}) => {
  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center print:hidden select-none">
      {/* Tooltip hint when closed */}
      {!isOpen && (
        <div
          onClick={onToggle}
          className="hidden md:flex items-center gap-2 mr-3 px-3.5 py-2 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium shadow-xl border border-emerald-500/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-slate-900 group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">
            {language === 'ta' ? 'Ask Curcuma உதவியாளர்' : 'Ask Curcuma'}
          </span>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Close Ask Curcuma chat' : 'Open Ask Curcuma chat'}
        className={`relative group flex items-center justify-center p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-900 border border-slate-700 rotate-90 scale-95'
            : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-500 border border-emerald-400/40 hover:shadow-emerald-500/30 hover:scale-110 animate-pulse-glow'
        }`}
      >
        {/* Ambient Ring Glow */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-sm group-hover:bg-emerald-500/40 transition-all duration-300 -z-10" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 -rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>
        )}

        {/* Unread / Notification Ping Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

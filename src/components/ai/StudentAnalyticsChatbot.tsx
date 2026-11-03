/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  Maximize2,
  Minimize2,
  Check,
  Copy,
  BookOpen,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  outOfScope?: boolean;
}

interface StudentAnalyticsChatbotProps {
  embedded?: boolean;
}

export function StudentAnalyticsChatbot({ embedded = false }: StudentAnalyticsChatbotProps) {
  const { user, session, role, profile } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(embedded ? true : false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize greeting on first open or role change
  useEffect(() => {
    if (messages.length === 0 && user) {
      let greetingText = '';

      if (role === 'admin') {
        greetingText = `Hello **${profile?.full_name || 'Administrator'}**! I am **EduCareer AI**, your dataset-grounded analytics assistant.\n\nI have verified access to **Batch 2013J** records. You can ask me about **average readiness scores**, **placement readiness rates**, **risk level breakdowns**, or **curriculum topic recommendations**.`;
      } else if (role === 'trainer') {
        greetingText = `Welcome **${profile?.full_name || 'Trainer'}**! I am **EduCareer AI**.\n\nI can analyze your **assigned courses**, **student risk distributions**, and **readiness indicators** directly from the verified database.`;
      } else {
        greetingText = `Hi **${profile?.full_name || user.email?.split('@')[0] || 'there'}**! I am **EduCareer AI**, your personal academic analytics assistant.\n\nI can answer questions regarding your **academic profile**, **learning goals**, **career readiness status**, and **recommended study topics**.`;
      }

      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: greetingText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [user, role, profile, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if ((isOpen || embedded) && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading, embedded]);

  // Focus input on open or embedded mount
  useEffect(() => {
    if ((isOpen || embedded) && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized, embedded]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-msg' && m.content.trim().length > 0)
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      let token = session?.access_token;
      if (!token && supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData.session?.access_token;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/student-analytics-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error while contacting EduCareer AI.');
      }

      const assistantMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          outOfScope: data.outOfScope || false,
        },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to reach AI server.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Unable to complete request:** ${errMsg}\n\nPlease verify that you are signed in and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSuggestions = () => {
    if (role === 'admin') {
      return [
        'What is the average readiness score for batch 2013J?',
        'How many students are placement ready?',
        'Show the risk level distribution',
        'Which topics are most recommended for students?',
      ];
    }
    if (role === 'trainer') {
      return [
        'What courses are assigned to me?',
        'Show the risk breakdown for my students',
        'Which students require immediate intervention?',
      ];
    }
    return [
      'What is my current career readiness status?',
      'What learning topics are recommended for me?',
      'What are my recorded learning goals and education level?',
      'Check my attendance and assignment submission logs',
    ];
  };

  if (!user) {
    return null;
  }

  // Render Full Embedded Chatbot Interface (when used inside AI Learning Assistant page view)
  if (embedded) {
    return (
      <div className="w-full h-[620px] max-h-[80vh] bg-white dark:bg-[#172033] rounded-2xl border border-slate-200 dark:border-[#273449] flex flex-col overflow-hidden shadow-xs transition-colors">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-[#111827] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 dark:border-[#273449] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-[#0D9488] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white dark:text-[#F8FAFC]">EduCareer AI</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-500/20 text-teal-300 dark:text-[#2DD4BF] border border-teal-500/30 rounded-md">
                  {role || 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grounded in verified student dataset records</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 dark:hover:bg-[#1f293d] border border-slate-700/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset Chat Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Session</span>
            </button>
          </div>
        </div>

        {/* Grounding Notice Banner */}
        <div className="bg-teal-50/70 dark:bg-[#111827] px-4 py-2 border-b border-teal-100 dark:border-[#273449] flex items-center justify-between text-xs text-teal-900 dark:text-teal-300 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-[#2DD4BF] shrink-0" />
            <span>AI responses are strictly grounded in your authenticated student profile and dataset records.</span>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-[#0B1120]/70 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2.5 max-w-[90%] sm:max-w-[80%]">
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-teal-600 dark:bg-[#0D9488] text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl relative group ${
                    msg.role === 'user'
                      ? 'bg-teal-600 dark:bg-[#0D9488] text-white rounded-br-none shadow-xs'
                      : msg.outOfScope
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-bl-none shadow-xs'
                      : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#273449] rounded-bl-none shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => handleCopyText(msg.id, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/80 dark:bg-[#172033]/80 border border-transparent dark:border-[#273449] rounded transition-opacity cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="space-y-1.5 pr-4 whitespace-pre-line leading-relaxed">
                    {msg.content}
                  </div>

                  <div
                    className={`text-[10px] mt-1.5 text-right ${
                      msg.role === 'user' ? 'text-teal-100 dark:text-teal-200/70' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-2">
              <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">EduCareer AI is querying your student records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-4 py-2.5 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-[#273449] shrink-0">
          <div className="text-[10px] font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF]" />
            <span>Suggested Dataset Inquiries:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {getSuggestions().map((sugg, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sugg)}
                disabled={isLoading}
                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-[#2DD4BF] border border-slate-200 dark:border-[#273449] hover:border-teal-200 dark:hover:border-teal-800/60 rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {sugg}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#273449] flex items-center gap-3 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder="Ask EduCareer AI about your readiness score, risk tier, or recommended topics..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-[#273449] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  // Floating Widget Mode (when mounted globally as a floating assistant)
  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-full shadow-lg hover:shadow-teal-500/25 transition-all duration-200 transform hover:-translate-y-0.5 group focus:outline-none focus:ring-4 focus:ring-teal-500/30 cursor-pointer"
          aria-label="Open Dataset Analytics Chatbot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <span className="text-sm font-semibold tracking-wide">EduCareer AI</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
            {role || 'Student'}
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-[#172033] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#273449] flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[440px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-slate-900 dark:bg-[#111827] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 dark:border-[#273449] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-[#0D9488] flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight text-white dark:text-[#F8FAFC]">EduCareer AI</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-teal-500/20 text-teal-300 dark:text-[#2DD4BF] border border-teal-500/30 rounded">
                    {role || 'Student'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Grounded in verified dataset</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-[#1f293d] rounded-lg transition-colors cursor-pointer"
                title="Restart Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-[#1f293d] rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-[#1f293d] rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Notice Banner */}
              <div className="bg-teal-50 dark:bg-[#111827]/90 px-3 py-1.5 border-b border-teal-100 dark:border-[#273449] flex items-center justify-between text-[11px] text-teal-900 dark:text-teal-300 shrink-0">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-[#2DD4BF] shrink-0" />
                  <span>Answering strictly from active student dataset records</span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-[#0B1120]/70 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[88%]">
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full bg-teal-600 dark:bg-[#0D9488] text-white flex items-center justify-center shrink-0 mb-1">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl relative group ${
                          msg.role === 'user'
                            ? 'bg-teal-600 dark:bg-[#0D9488] text-white rounded-br-none shadow-xs'
                            : msg.outOfScope
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-bl-none shadow-xs'
                            : 'bg-white dark:bg-[#111827] text-slate-800 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#273449] rounded-bl-none shadow-xs'
                        }`}
                      >
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/80 dark:bg-[#172033]/80 border border-transparent dark:border-[#273449] rounded transition-opacity cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <div className="space-y-1.5 pr-4 whitespace-pre-line leading-relaxed">
                          {msg.content}
                        </div>

                        <div
                          className={`text-[9px] mt-1.5 text-right ${
                            msg.role === 'user' ? 'text-teal-100 dark:text-teal-200/70' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mb-1">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <span className="italic">Analyzing verified student records...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Pills */}
              <div className="px-3 py-2 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-[#273449] shrink-0">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-teal-600 dark:text-[#2DD4BF]" />
                  <span>Suggested Dataset Inquiries:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {getSuggestions().map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sugg)}
                      disabled={isLoading}
                      className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#172033] hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-[#2DD4BF] border border-slate-200 dark:border-[#273449] hover:border-teal-200 dark:hover:border-teal-800/60 rounded-full transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#273449] flex items-center gap-2 shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask a question about the student dataset..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-[#172033] border border-slate-300 dark:border-[#273449] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

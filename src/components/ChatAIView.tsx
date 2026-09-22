import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../services/soundEngine';
import { ChatMessage } from '../types';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  Copy,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  Info,
  Check,
} from 'lucide-react';

export const ChatAIView: React.FC = () => {
  const { currentSchool } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya adalah DESAKA AI — Customer Service Pintar & Asisten Sekolah untuk ${currentSchool.name}. Saya siap menjawab pertanyaan tentang jadwal sekolah, petunjuk aplikasi bel otomatis, pengetahuan umum, pelajaran, maupun bantuan lainnya. Ada yang bisa saya bantu hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [style, setStyle] = useState<'singkat' | 'normal' | 'detail'>('normal');
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize Speech Recognition for mic input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Browser Anda belum mendukung input suara mikrofon.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      soundEngine.stopAll();
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleSend = async (customText?: string) => {
    const query = customText || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          style,
          schoolName: currentSchool.name,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Maaf, saya belum dapat memproses jawaban saat ini.';

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isDemo: data.isDemo,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak answer if autoSpeak is enabled
      if (autoSpeak) {
        setIsSpeaking(true);
        soundEngine.speakText(replyText, {
          lang: 'id',
          rate: 1.0,
          onEnd: () => setIsSpeaking(false),
        });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: 'Terjadi gangguan jaringan saat menghubungi layanan AI. Silakan periksa koneksi internet Anda.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        isDemo: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakMessage = (text: string) => {
    if (isSpeaking) {
      soundEngine.stopAll();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      soundEngine.speakText(text, {
        lang: 'id',
        rate: 1.0,
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    soundEngine.stopAll();
    setIsSpeaking(false);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Percakapan baru telah dimulai. Halo dari DESAKA AI untuk ${currentSchool.name}! Apa yang bisa saya bantu?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickQuestions = [
    'Bagaimana cara mengatur jadwal bel otomatis?',
    'Apa saja jenis nada bel yang tersedia?',
    'Bagaimana cara menghubungkan aplikasi ke speaker sekolah?',
    'Jelaskan tentang Kurikulum Merdeka di sekolah.',
    'Berapa lama durasi istirahat sekolah hari ini?',
  ];

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in">
      
      {/* Top Header */}
      <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              DESAKA AI Chat — Customer Service & Asisten Pintar
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Online
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Pelayanan virtual sekolah, asisten panduan, dan pusat pengetahuan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Style selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
            {(['singkat', 'normal', 'detail'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  style === s
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Auto Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              autoSpeak
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
            title={autoSpeak ? 'Suara AI Otomatis Aktif' : 'Suara AI Nonaktif'}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden md:inline">Baca Jawaban</span>
          </button>

          {/* Reset Chat */}
          <button
            onClick={resetChat}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Mulai Percakapan Baru"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isBot = m.role === 'assistant';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                  isBot
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-sm'
                    : 'bg-blue-600'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed relative group ${
                  isBot
                    ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60'
                    : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Footer timestamp & action buttons */}
                <div
                  className={`flex items-center gap-2 mt-2 pt-1 border-t ${
                    isBot ? 'border-slate-200/50 dark:border-slate-700/50 text-slate-400' : 'border-blue-500/50 text-blue-200'
                  } text-[10px]`}
                >
                  <span>{m.timestamp}</span>

                  {isBot && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => speakMessage(m.content)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5"
                        title="Dengarkan Suara AI"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(m.id, m.content)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 p-0.5"
                        title="Salin Pesan"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">DESAKA AI sedang berpikir...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Pertanyaan Populer:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3 rounded-2xl transition-all shadow-sm ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600'
            }`}
            title={isListening ? 'Mendengarkan suara Anda...' : 'Bicara lewat Mikrofon'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Silakan berbicara...' : 'Ketik pertanyaan untuk DESAKA AI...'}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Stop TTS Button if active */}
          {isSpeaking && (
            <button
              type="button"
              onClick={() => {
                soundEngine.stopAll();
                setIsSpeaking(false);
              }}
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              title="Berhenti Berbicara"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>

    </div>
  );
};

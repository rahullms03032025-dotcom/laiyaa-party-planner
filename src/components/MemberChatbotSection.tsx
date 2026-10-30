import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  Smile,
  HelpCircle,
  Clock,
  Shield,
  UtensilsCrossed,
  MapPin,
  Calendar,
  CheckCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type { ChatMessage, User, Party, MaterialItem, SnackDuty } from '../types/party.ts';

interface MemberChatbotSectionProps {
  messages: ChatMessage[];
  currentUser: User | null;
  party: Party;
  materials: MaterialItem[];
  duties: SnackDuty[];
  onSendMessage: (text: string) => Promise<any>;
  onReactMessage: (messageId: string, emoji: string) => Promise<any>;
  onAskBot: (question: string) => Promise<any>;
  onRequestLogin: () => void;
  onRefreshMessages: () => void;
}

export const MemberChatbotSection: React.FC<MemberChatbotSectionProps> = ({
  messages,
  currentUser,
  party,
  materials,
  duties,
  onSendMessage,
  onReactMessage,
  onAskBot,
  onRequestLogin,
  onRefreshMessages,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'bot_only'>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      onRequestLogin();
      return;
    }
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    const isAskingBot =
      textToSend.toLowerCase().includes('@laiyaabot') ||
      textToSend.toLowerCase().includes('@bot') ||
      textToSend.toLowerCase().startsWith('bot');

    if (isAskingBot) {
      setIsBotThinking(true);
    }

    try {
      await onSendMessage(textToSend);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      setIsBotThinking(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (!currentUser) {
      onRequestLogin();
      return;
    }
    setIsBotThinking(true);
    try {
      await onAskBot(question);
    } catch (err) {
      console.error('Failed to ask chatbot:', err);
    } finally {
      setIsBotThinking(false);
    }
  };

  const quickPills = [
    { label: '🧅 Who is bringing what?', query: 'Who is bringing what items from home?' },
    { label: '🔪 Who will do what in snack making?', query: 'Who will do what in making snacks?' },
    { label: '📍 Venue & Time reminder?', query: 'Where and when is the party happening?' },
    { label: '🥣 Secret crisp recipe tip?', query: 'What is the secret recipe for crisp murmura?' },
    { label: '☕ Cutting chai arrangement?', query: 'Is cutting chai planned with the Laiyaa?' },
  ];

  const displayedMessages = activeTab === 'bot_only'
    ? messages.filter((m) => m.isBot || m.text.toLowerCase().includes('@bot') || m.text.toLowerCase().includes('@laiyaabot'))
    : messages;

  return (
    <section id="member-chat" className="py-12 bg-stone-50/60 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wide uppercase mb-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-700" />
              <span>7 Members Adda & Live AI Chatbot</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Doston Ka Adda Chat & LaiyaaBot</span>
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Sabhi 7 members (Rahul, Ankur, Yash, Nityanand, Ankita, Priyanka, Himani) yahan aapas me communicate kar sakte hain, aur <strong>@LaiyaaBot (Chef Murmura)</strong> se live party details poochh sakte hain!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'all' ? 'bot_only' : 'all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                activeTab === 'bot_only'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{activeTab === 'bot_only' ? 'Show All Chat' : 'Show Bot Q&A Only'}</span>
            </button>

            <button
              onClick={onRefreshMessages}
              className="p-2 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
              title="Refresh messages"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chat Main Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold relative shadow-xs">
                <UtensilsCrossed className="w-5 h-5" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    LMS Laiyaa Adda Room
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    LMS Certifications Private Limited
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5 font-medium">
                  <span>7 Members</span>
                  <span>·</span>
                  <span className="text-emerald-400">LaiyaaBot Active 24/7</span>
                  <span>·</span>
                  <span>100% Home Potluck</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              {currentUser ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Chatting as: <strong>{currentUser.name}</strong> (@{currentUser.username})</span>
                </div>
              ) : (
                <button
                  onClick={onRequestLogin}
                  className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs"
                >
                  Login to Chat
                </button>
              )}
            </div>
          </div>

          {/* Quick Bot Suggestion Pills Bar */}
          <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Ask LaiyaaBot:</span>
            </span>
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(pill.query)}
                disabled={isBotThinking}
                className="text-[11px] px-3 py-1 rounded-full bg-white hover:bg-amber-100 text-amber-950 font-medium border border-amber-200 shadow-2xs shrink-0 transition-colors disabled:opacity-50"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Message List Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/30">
            {displayedMessages.map((msg) => {
              const isMe = currentUser?.id === msg.senderId;
              const isBotMsg = msg.isBot;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    isBotMsg
                      ? 'mx-auto w-full max-w-3xl'
                      : isMe
                      ? 'ml-auto flex-row-reverse'
                      : 'mr-auto'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isBotMsg ? (
                      <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs border border-amber-300">
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col ${
                      isMe && !isBotMsg ? 'items-end' : 'items-start'
                    } max-w-[85%]`}
                  >
                    {/* Sender Tag & Timestamp */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-bold text-stone-800">
                        {msg.senderName}
                      </span>
                      {msg.senderUsername && (
                        <span className="text-[10px] text-stone-500 font-mono">
                          @{msg.senderUsername}
                        </span>
                      )}
                      {msg.senderRole === 'admin' && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                          ADMIN
                        </span>
                      )}
                      {isBotMsg && (
                        <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>AI BOT</span>
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                        isBotMsg
                          ? 'bg-amber-50 border border-amber-300/80 text-amber-950 font-medium'
                          : isMe
                          ? 'bg-amber-600 text-white rounded-tr-none'
                          : 'bg-white border border-stone-200 text-stone-900 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1 mt-1.5 px-1">
                      {msg.reactions &&
                        Object.entries(msg.reactions).map(([emoji, userIds]) => {
                          const hasReacted = currentUser && userIds.includes(currentUser.id);
                          return (
                            <button
                              key={emoji}
                              onClick={() => {
                                if (!currentUser) onRequestLogin();
                                else onReactMessage(msg.id, emoji);
                              }}
                              className={`px-2 py-0.5 rounded-full text-[11px] border font-mono flex items-center gap-1 transition-colors ${
                                hasReacted
                                  ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{userIds.length}</span>
                            </button>
                          );
                        })}

                      {/* Quick Add Reaction Popover triggers */}
                      <div className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity ml-1">
                        {['🔥', '❤️', '🧅', '👍'].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (!currentUser) onRequestLogin();
                              else onReactMessage(msg.id, emoji);
                            }}
                            className="p-1 hover:bg-stone-200/60 rounded text-[11px] transition-colors"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bot Thinking Bubble */}
            {isBotThinking && (
              <div className="flex gap-3 max-w-xl mx-auto w-full animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-medium">
                  🤖 LaiyaaBot murmura recipe aur party database check kar raha hai...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  currentUser
                    ? `Message as @${currentUser.username} (or type @LaiyaaBot to ask chef)...`
                    : 'Pehle login karein chat me likhne ke liye...'
                }
                disabled={!currentUser || isSending}
                className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-500 font-medium disabled:bg-stone-50"
              />

              {/* Ask Bot Direct Button */}
              <button
                type="button"
                onClick={() => {
                  if (!inputText.trim()) {
                    handleQuickQuestion('Who is bringing what and who is doing what?');
                  } else {
                    handleQuickQuestion(inputText);
                    setInputText('');
                  }
                }}
                disabled={!currentUser || isSending}
                className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-50"
                title="Directly trigger LaiyaaBot AI response"
              >
                <Bot className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Ask Bot</span>
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!currentUser || !inputText.trim() || isSending}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bhejo</span>
              </button>
            </form>

            <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <span>Tag: <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-700 font-mono font-bold">@LaiyaaBot</code> chef ke tips ke liye</span>
              </div>
              <div className="hidden sm:block">
                All messages synced to Admin database
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

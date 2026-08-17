'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  Trash2,
  Reply,
  Paperclip,
  ImageIcon,
  Sparkles,
  Shield,
  X,
  User,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inputContent, setInputContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setCurrentUser(data.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/chat/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages || []);
        setPinnedMessages(data.data.pinnedMessages || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchMessages();

    // Setup SSE stream for realtime updates
    const sse = new EventSource('/api/chat/sse');
    sse.addEventListener('message:new', (event) => {
      try {
        const newMsgs = JSON.parse(event.data);
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m._id));
          const filteredNew = newMsgs.filter((m: any) => !ids.has(m._id));
          if (filteredNew.length > 0) {
            return [...prev, ...filteredNew];
          }
          return prev;
        });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      sse.close();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'ganesh_puja/chat');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      setUploading(false);
      if (data.success) {
        setAttachmentUrl(data.data.url);
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() && !attachmentUrl) return;

    const body = {
      content: inputContent,
      attachmentUrl,
      replyTo: replyingTo?._id || undefined,
    };

    setInputContent('');
    setAttachmentUrl('');
    setReplyingTo(null);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        scrollToBottom();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (id: string, isCurrentlyPinned: boolean) => {
    try {
      const res = await fetch(`/api/chat/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isCurrentlyPinned ? 'unpin' : 'pin' }),
      });
      const data = await res.json();
      if (data.success) fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-amber-100 shadow-festive overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 md:p-6 gradient-maroon text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl gradient-gold text-maroon-950 font-black flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 fill-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-lg text-amber-200 flex items-center gap-2">
              Committee Private Group Chat
            </h1>
            <p className="text-[11px] text-amber-300/80 font-medium">
              13 Committee Members • Realtime Encrypted Communication
            </p>
          </div>
        </div>

        {pinnedMessages.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-sm">
            <Pin className="w-3.5 h-3.5 fill-amber-300" />
            <span>{pinnedMessages.length} Pinned</span>
          </div>
        )}
      </div>

      {/* Pinned Messages Banner */}
      {pinnedMessages.length > 0 && (
        <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center gap-3 overflow-x-auto">
          <Pin className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <div className="text-xs text-amber-900 font-semibold flex items-center gap-4 truncate">
            {pinnedMessages.map((p) => (
              <span key={p._id} className="truncate">
                <strong className="text-maroon-900">{p.sender?.name}:</strong> {p.content}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-festive-cream/30">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-12 animate-pulse">Loading chat messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-12">No chat messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUser?._id;
            return (
              <div key={msg._id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-amber-200 text-maroon-900 font-bold flex items-center justify-center text-xs flex-shrink-0 overflow-hidden border border-amber-300">
                  {msg.sender?.profileImage ? (
                    <img src={msg.sender.profileImage} alt={msg.sender?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{msg.sender?.name?.charAt(0) || 'M'}</span>
                  )}
                </div>

                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start'}`}>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 px-1">
                    <span className="font-bold text-gray-800">{msg.sender?.name}</span>
                    <span>• {formatDateTime(msg.createdAt)}</span>
                  </div>

                  {/* Reply Banner inside message bubble */}
                  {msg.replyTo && (
                    <div className="p-2 rounded-xl bg-gray-100 border-l-4 border-amber-500 text-[11px] text-gray-600 mb-1">
                      <span className="font-bold text-gray-900">{msg.replyTo?.sender?.name}:</span> {msg.replyTo?.content}
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium shadow-sm relative group ${
                      isMe
                        ? 'gradient-maroon text-white rounded-tr-none'
                        : 'bg-white text-gray-900 border border-amber-100 rounded-tl-none'
                    }`}
                  >
                    {msg.attachmentUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden bg-black/10">
                        <img src={msg.attachmentUrl} alt="Attachment" className="max-h-48 object-cover rounded-lg" />
                      </div>
                    )}
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>

                    {/* Action buttons on hover */}
                    <div
                      className={`absolute top-2 ${
                        isMe ? '-left-16' : '-right-16'
                      } hidden group-hover:flex items-center gap-1 bg-white p-1 rounded-xl shadow-md border border-gray-100 z-10`}
                    >
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className="p-1 text-gray-500 hover:text-amber-600"
                        title="Reply"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleTogglePin(msg._id, msg.isPinned)}
                        className="p-1 text-gray-500 hover:text-amber-600"
                        title={msg.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      {(isMe || currentUser?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="p-1 text-gray-500 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-amber-100/70 border-t border-amber-200 flex items-center justify-between text-xs text-maroon-900 font-medium">
          <div className="truncate">
            Replying to <strong className="font-bold">{replyingTo.sender?.name}</strong>: {replyingTo.content}
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-amber-200 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Preview Banner */}
      {attachmentUrl && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
          <span>Image attachment ready to send</span>
          <button onClick={() => setAttachmentUrl('')} className="p-1 hover:bg-emerald-100 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-amber-100 flex items-center gap-3">
        <label className="p-2.5 rounded-xl text-gray-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer transition-colors">
          <Paperclip className="w-5 h-5" />
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Type your message to committee members..."
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-amber-500"
        />

        <button
          type="submit"
          disabled={(!inputContent.trim() && !attachmentUrl) || uploading}
          className="p-3 rounded-2xl gradient-maroon text-white font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  UserRound,
  MessageSquare,
  Sparkles,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { sanitizeAuthor, sanitizeMessage } from './services/firebaseService.js';

export function SignNoteModal({
  isOpen,
  onClose,
  currentAuthor = '@guest',
  currentMessage = '',
  currentColor = '#00f0ff',
  onSave
}) {
  const [authorInput, setAuthorInput] = useState(currentAuthor);
  const [messageInput, setMessageInput] = useState(currentMessage);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthorInput(currentAuthor || '@guest');
      setMessageInput(currentMessage || '');
      setError('');
      setIsSaving(false);
    }
  }, [isOpen, currentAuthor, currentMessage]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAuthor = sanitizeAuthor(authorInput);
    if (!cleanAuthor || cleanAuthor === '@' || cleanAuthor === '@guest') {
      setError('Please choose a personalized handle (e.g. @yourname)');
      return;
    }

    const cleanMsg = sanitizeMessage(messageInput);
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave({
          author: cleanAuthor,
          message: cleanMsg
        });
      }
      onClose();
    } catch (err) {
      setError('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0c1424]/98 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-cyan-100 relative">
        
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-bold shadow-md">
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">Sign Guestbook</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Leave your handle and note on the canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          
          {/* Callsign / Name Input */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Callsign / Name *</span>
            </label>
            <input
              type="text"
              value={authorInput}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith('@')) val = '@' + val;
                setAuthorInput(val);
                if (error) setError('');
              }}
              placeholder="@yourname"
              maxLength={20}
              autoFocus
              className="w-full rounded-xl border border-cyan-500/30 bg-[#060a14] py-2.5 px-3.5 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-mono font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Example: @ashin, @neo, @explorer
            </p>
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Guestbook Note</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageInput.length}/80
              </span>
            </label>
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value.slice(0, 80))}
              placeholder="Leave a greeting, feedback, or a friendly hello..."
              rows={2}
              maxLength={80}
              className="w-full resize-none rounded-xl border border-cyan-500/30 bg-[#060a14] p-3 text-base sm:text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
            />
          </div>


          {/* Live Preview Card */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Live Preview
            </span>
            <div className="p-3 rounded-2xl bg-[#060a14] border border-white/10 flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full border border-white/80 shadow-sm shrink-0"
                style={{
                  backgroundColor: currentColor,
                  boxShadow: `0 0 10px ${currentColor}`
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {authorInput || '@guest'}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">Just now</span>
                </div>
                <p className="text-xs text-slate-300 truncate">
                  {messageInput || 'Drawing on the canvas...'}
                </p>
              </div>
            </div>
          </div>

          {/* Protection Notice */}
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200/90 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Your placed marks are signed with your callsign so other visitors can discover your artwork.
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>{isSaving ? 'Signing…' : 'Sign & Set Callsign'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default SignNoteModal;

import React from 'react';
import {
  X,
  Crosshair,
  Sparkles,
  MessageSquare,
  ChevronDown,
  Clock,
  Radio,
  Send
} from 'lucide-react';
import { formatRelativeTime, getSectorName } from './telemetry.js';

export function GuestbookDrawer({
  isOpen,
  onClose,
  transmissions = [],
  transmissionsError = '',
  onLocate,
  isolatedAuthor = null,
  onToggleIsolate,
  onOpenSignModal
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity animate-fade-in"
        aria-label="Close transmissions drawer"
      />

      {/* Drawer Container */}
      <div className="relative pointer-events-auto w-full max-w-2xl mx-auto max-h-[75vh] md:max-h-[420px] bg-[#0c1424]/95 backdrop-blur-2xl border-t md:border border-cyan-500/30 rounded-t-3xl md:rounded-3xl shadow-[0_-10px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-slide-up text-cyan-100 mb-0 md:mb-4">
        
        {/* Top Handle & Header */}
        <div className="pt-2 px-4 pb-3 border-b border-white/10 flex flex-col gap-2 shrink-0">
          <div
            className="w-10 h-1 bg-white/20 rounded-full mx-auto cursor-pointer hover:bg-white/40 transition-colors"
            onClick={onClose}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Guestbook Notes</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {transmissions.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Transmissions recorded on the collaborative canvas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenSignModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSignModal();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Leave Note</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close drawer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Transmissions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {transmissionsError && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
              {transmissionsError}
            </div>
          )}

          {transmissions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-1" />
              <p className="text-xs font-semibold text-slate-300">No guestbook notes yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Be the first to leave your callsign and a note on the canvas!
              </p>
              {onOpenSignModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSignModal();
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-colors"
                >
                  ✍️ Sign First Note
                </button>
              )}
            </div>
          ) : (
            transmissions.map((tx) => {
              const hasMessage = Boolean(tx.message && tx.message.trim());
              const isSpotlighted = isolatedAuthor && tx.author && isolatedAuthor.toLowerCase() === tx.author.toLowerCase();
              const timeStr = formatRelativeTime(tx.timestamp);

              return (
                <div
                  key={tx.id || `${tx.x}_${tx.y}_${tx.timestamp}`}
                  className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isSpotlighted
                      ? 'bg-cyan-950/40 border-cyan-400/70 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-[#070c18] border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs shrink-0"
                        style={{
                          backgroundColor: tx.color || '#00f0ff',
                          boxShadow: tx.color ? `0 0 8px ${tx.color}` : 'none'
                        }}
                      />
                      <span className="font-bold text-xs text-white">
                        {tx.author || '@guest'}
                      </span>
                      <span className="text-[10px] text-cyan-400/70 font-mono">
                        [{String(tx.x).padStart(2, '0')}, {String(tx.y).padStart(2, '0')}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{timeStr}</span>
                    </div>
                  </div>

                  {hasMessage && (
                    <p className="text-xs text-slate-200 bg-white/5 p-2 rounded-xl border border-white/5 font-sans leading-relaxed">
                      "{tx.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[10px] text-slate-400">
                      {getSectorName(tx.x, tx.y)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Spotlight Button */}
                      {onToggleIsolate && tx.author && (
                        <button
                          onClick={() => onToggleIsolate(tx.author)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            isSpotlighted
                              ? 'bg-cyan-400 text-black shadow-xs font-bold'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                          title="Spotlight all marks by this author"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isSpotlighted ? 'Spotlighted' : 'Spotlight'}</span>
                        </button>
                      )}

                      {/* Locate Button */}
                      {onLocate && (
                        <button
                          onClick={() => {
                            onLocate(tx.x, tx.y);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[10px] transition-colors"
                          title="Pan canvas to mark"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>Locate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

export default GuestbookDrawer;

import React from 'react';
import { MessageSquare, MapPin } from 'lucide-react';
import { getGlowStyle } from './palette.js';

function isRealMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const t = msg.trim();
  if (!t) return false;
  if (/placed \d+-pixel/i.test(t)) return false;
  if (/dropped \d+-pixel/i.test(t)) return false;
  if (/cyber stamp/i.test(t)) return false;
  if (/^broadcast transmission$/i.test(t)) return false;
  return true;
}

/**
 * TransmissionsFeed Component (Clean & Minimal Guestbook Feed)
 * 
 * Only shows authentic guest messages and a direct link to locate their glyph.
 */
export default function TransmissionsFeed({
  transmissions = [],
  onLocate = null
}) {
  const authenticMessages = (transmissions || []).filter(item => isRealMessage(item.message));

  const handleEntryClick = (item) => {
    if (onLocate) {
      onLocate(item.x, item.y, item.color, item.freq, item.author);
    }
  };

  return (
    <div className="bg-[#0a0f20]/90 border border-cyan-500/20 rounded-2xl p-4 text-xs font-sans text-cyan-100 shadow-lg backdrop-blur-md flex flex-col h-full max-h-[360px]">
      
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-cyan-500/20">
        <div className="flex items-center space-x-2 text-cyan-300 font-bold">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Visitor Messages</span>
        </div>
        <span className="text-[11px] text-cyan-400/80 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-mono">
          {authenticMessages.length} notes
        </span>
      </div>

      {/* Messages List */}
      <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 custom-scrollbar">
        {authenticMessages.length === 0 ? (
          <div className="text-center py-8 text-cyan-400/50 text-xs italic bg-[#050914]/50 rounded-xl p-4 border border-cyan-500/10">
            No visitor messages yet. Be the first to leave your note!
          </div>
        ) : (
          authenticMessages.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3 rounded-xl bg-[#050914] border border-cyan-500/15 hover:border-cyan-400/50 transition-all flex flex-col gap-2"
            >
              {/* Guest Name & Message */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ 
                      backgroundColor: item.color || '#00f0ff',
                      boxShadow: item.color ? getGlowStyle(item.color) : 'none'
                    }} 
                  />
                  <span className="font-bold text-xs text-cyan-200">
                    {item.author || '@guest'}
                  </span>
                </div>
                <p className="text-xs text-cyan-100/90 italic pl-4 leading-relaxed">
                  "{item.message}"
                </p>
              </div>

              {/* Direct Link to Locate Their Glyph */}
              <button
                onClick={() => handleEntryClick(item)}
                className="self-start ml-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-200 transition-colors py-0.5 hover:underline"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Locate glyph →</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

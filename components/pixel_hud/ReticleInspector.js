import React, { useState, useEffect } from 'react';
import { Crosshair, User, MessageCircle, Clock, Music, Eye, EyeOff, Zap, Sparkles, Lock, Check } from 'lucide-react';
import { getColorByHex, getGlowStyle } from './palette.js';
import { C_MINOR_PENTATONIC_SCALE } from './WebAudioSynth.js';
import { formatRelativeTime, getSectorName, getHarmonicNoteForY } from './telemetry.js';

export { formatRelativeTime, getSectorName, getHarmonicNoteForY };

/**
 * ReticleInspector Component
 * 
 * Displays friendly tile metadata, creator name, visitor note, and musical pitch.
 */
export default function ReticleInspector({
  hoveredCoord = null,
  cellData = null,
  authorCallsign = '@guest',
  transmissions = [],
  isolatedAuthor = null,
  onToggleIsolate = null,
  onLocate = null
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const hasCoord = Boolean(hoveredCoord && (hoveredCoord.inBounds !== false) && (hoveredCoord.x !== undefined || hoveredCoord.gx !== undefined));
  const gx = hasCoord ? (hoveredCoord.gx !== undefined ? hoveredCoord.gx : hoveredCoord.x) : -1;
  const gy = hasCoord ? (hoveredCoord.gy !== undefined ? hoveredCoord.gy : hoveredCoord.y) : -1;
  const sector = hasCoord ? getSectorName(gx, gy) : 'Wall Center';

  // Compute harmonic tone info
  const noteIndex = hasCoord ? Math.min(15, Math.max(0, Math.floor(((63 - gy) / 64) * 16))) : 0;
  const noteInfo = C_MINOR_PENTATONIC_SCALE[noteIndex] || { note: 'C4', freq: 261.63 };

  const isCellOccupied = Boolean(cellData && cellData.color);
  const cellColor = isCellOccupied ? (cellData.color || cellData.c) : null;

  // 1. Look up any transmission specifically matching this exact (gx, gy) coordinate
  const exactCoordTx = (gx >= 0 && gy >= 0 && Array.isArray(transmissions))
    ? transmissions.find(t => t && t.x === gx && t.y === gy)
    : null;

  // 2. Look up by author if coordinate didn't match directly
  const authorTx = (cellData?.author && Array.isArray(transmissions))
    ? transmissions.find(t => t && t.author && t.author.toLowerCase() === cellData.author.toLowerCase())
    : null;

  const matchingTx = exactCoordTx || authorTx;

  const cellAuthor = isCellOccupied
    ? (cellData.author || cellData.a || matchingTx?.author || '@guest')
    : (matchingTx?.author || null);

  const isCurrentAuthorOwner = Boolean(
    cellAuthor &&
    authorCallsign &&
    cellAuthor.trim().toLowerCase() === authorCallsign.trim().toLowerCase()
  );

  // Retrieve actual visitor note: check cellData.message, then matchingTx.message
  let actualMessage = '';
  if (cellData?.message && typeof cellData.message === 'string' && cellData.message.trim()) {
    actualMessage = cellData.message.trim();
  } else if (cellData?.m && typeof cellData.m === 'string' && cellData.m.trim()) {
    actualMessage = cellData.m.trim();
  } else if (matchingTx?.message && typeof matchingTx.message === 'string' && matchingTx.message.trim()) {
    actualMessage = matchingTx.message.trim();
  }

  const cellTimestamp = isCellOccupied
    ? (cellData.timestamp || cellData.t || matchingTx?.timestamp)
    : matchingTx?.timestamp;

  const isCurrentAuthorIsolated = isolatedAuthor && cellAuthor && isolatedAuthor.toLowerCase() === cellAuthor.toLowerCase();

  const handleIsolateClick = () => {
    if (!onToggleIsolate || !cellAuthor) return;
    if (isCurrentAuthorIsolated) {
      onToggleIsolate(null);
    } else {
      onToggleIsolate(cellAuthor);
    }
  };

  return (
    <div className="bg-[#0a0f20]/90 border border-cyan-500/20 rounded-2xl p-4 text-xs font-sans text-cyan-100 shadow-lg backdrop-blur-md transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-cyan-500/20">
        <div className="flex items-center space-x-2 text-cyan-300 font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Tile Inspector</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
          {hasCoord ? `Tile [${gx}, ${gy}]` : 'Hover a tile'}
        </span>
      </div>

      {/* Coordinate & Tone Pitch Cards */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#050914] p-2.5 rounded-xl border border-cyan-500/15">
          <div className="text-[10px] text-cyan-400/70 font-semibold uppercase">Position</div>
          <div className="text-xs font-mono font-bold text-cyan-200 mt-0.5">
            {hasCoord ? `X:${gx} · Y:${gy}` : 'Select tile'}
          </div>
        </div>

        <div className="bg-[#050914] p-2.5 rounded-xl border border-cyan-500/15">
          <div className="text-[10px] text-cyan-400/70 font-semibold uppercase flex items-center space-x-1">
            <Music className="w-3 h-3 text-pink-400" />
            <span>Tone Pitch</span>
          </div>
          <div className="text-xs font-mono font-bold text-cyan-200 mt-0.5">
            {hasCoord ? `${noteInfo.note} (${noteInfo.freq.toFixed(0)}Hz)` : 'Standby'}
          </div>
        </div>
      </div>

      {/* Cell Content Inspector */}
      {isCellOccupied || matchingTx ? (
        <div className="space-y-3 bg-[#050914] p-3 rounded-xl border border-cyan-500/25">
          {/* Creator & Timestamp */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-md border border-white/40 shadow-sm"
                style={{ 
                  backgroundColor: cellColor || matchingTx?.color || '#00f0ff',
                  boxShadow: (cellColor || matchingTx?.color) ? getGlowStyle(cellColor || matchingTx?.color) : 'none'
                }}
              />
              <div className="flex items-center space-x-1 font-bold text-cyan-100">
                <span>{cellAuthor}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[11px] text-cyan-400/70">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(cellTimestamp)}</span>
            </div>
          </div>

          {/* Mark Protection / Claim Status Badge */}
          <div className="flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium border border-cyan-500/20 bg-[#080d1e]">
            {isCurrentAuthorOwner ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff66]" />
                Claimed by you (Editable)
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Protected · Claimed by {cellAuthor}
              </span>
            )}
          </div>

          {/* Visitor Note */}
          <div className="bg-[#080d1e] rounded-xl p-2.5 border border-cyan-500/15 text-cyan-100 text-xs">
            <div className="text-[10px] text-cyan-400/70 uppercase font-semibold mb-1 flex items-center space-x-1">
              <MessageCircle className="w-3 h-3 text-cyan-400" />
              <span>Visitor Message</span>
            </div>
            {actualMessage ? (
              <p className="text-cyan-100 leading-relaxed font-normal">
                &ldquo;{actualMessage}&rdquo;
              </p>
            ) : (
              <p className="text-slate-400 italic">
                No note attached to this tile.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <button
              onClick={handleIsolateClick}
              className={`flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                isCurrentAuthorIsolated
                  ? 'bg-pink-600/30 border-pink-400 text-pink-200 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/30 text-cyan-300'
              }`}
            >
              {isCurrentAuthorIsolated ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Show All</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Only {cellAuthor}</span>
                </>
              )}
            </button>

            {onLocate && gx >= 0 && gy >= 0 && (
              <button
                onClick={() => onLocate(gx, gy)}
                className="flex items-center space-x-1 py-1.5 px-3 rounded-xl text-xs bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-all font-semibold"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Locate</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 px-4 bg-[#050914]/60 rounded-xl border border-cyan-500/10 text-cyan-400/60 text-xs">
          <p>This tile is currently empty.</p>
          <p className="text-[11px] text-cyan-500/40 mt-1">Select a color to paint or sign your name!</p>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import {
  Brush, Eraser, Stamp, Hand, ScanSearch, Send, Volume2, VolumeX,
  Maximize2, UserRound, X, Sparkles, Undo2, Redo2, MessageSquare
} from 'lucide-react';
import { PALETTE } from './palette.js';
import { STAMPS } from './stamps.js';
import ReticleInspector from './ReticleInspector.js';
import TransmissionsFeed from './TransmissionsFeed.js';
import { getTransmissionCooldownRemaining } from './services/firebaseService.js';

const TOOLS = [
  { id: 'paint', label: 'Draw', icon: Brush },
  { id: 'eraser', label: 'Erase', icon: Eraser },
  { id: 'stamp', label: 'Stamp', icon: Stamp },
  { id: 'pan', label: 'Move', icon: Hand },
  { id: 'inspect', label: 'Inspect', icon: ScanSearch }
];

/** A deliberately small, task-first control surface for PixelHUD. */
export default function HudSidebar({
  view: controlledView, onViewChange = null, initialView = 'make',
  activeTool = 'paint', onSelectTool = () => {}, activeColor = '#00f0ff',
  onSelectColor = () => {}, activeStampId = 'space_invader', onSelectStamp = () => {},
  authorCallsign = '@guest', onChangeAuthor = () => {}, transmissionMessage = '',
  onChangeMessage = () => {}, onSendTransmission = () => {}, totalMarks = 0,
  density = 0, hoveredCoord = null, hoveredCellData = null, isOnline = true,
  isMuted = false, onToggleMute = () => {}, transmissions = [], isolatedAuthor = null,
  transmissionsError = '', onToggleIsolate = () => {}, onLocate = () => {}, onCenterGrid = () => {}, onClearGrid = null,
  canUndo = false, canRedo = false, onUndo = () => {}, onRedo = () => {}
}) {
  const [internalView, setInternalView] = useState(initialView);
  const view = controlledView !== undefined ? controlledView : internalView;
  const setView = (v) => {
    if (onViewChange) onViewChange(v);
    else setInternalView(v);
  };

  useEffect(() => {
    if (initialView && controlledView === undefined) {
      setInternalView(initialView);
    }
  }, [initialView, controlledView]);

  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCooldown(getTransmissionCooldownRemaining()), 250);
    return () => clearInterval(timer);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (isSending || cooldown) return;
    setError('');
    setIsSending(true);
    try {
      await onSendTransmission(authorCallsign, transmissionMessage);
      setView('activity');
    } catch (err) {
      setError(err.message || 'That message could not be posted. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const authenticMessageCount = (transmissions || []).filter(item => {
    if (!item || !item.message || typeof item.message !== 'string') return false;
    const t = item.message.trim();
    if (!t) return false;
    if (/placed \d+-pixel|dropped \d+-pixel|cyber stamp|^broadcast transmission$/i.test(t)) return false;
    return true;
  }).length;

  return (
    <aside className="w-full md:w-[344px] h-full shrink-0 overflow-hidden bg-[#0c1424] text-slate-200 border-l border-cyan-500/20 shadow-[-12px_0_32px_rgba(0,0,0,0.5)] font-sans flex flex-col">
      {/* Top Header & Telemetry Bar */}
      <div className="px-4 py-3 bg-[#080e1b] border-b border-cyan-500/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-white tracking-tight">GuestBook</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 bg-[#050914] border border-cyan-500/20 px-2 py-1 rounded-lg text-xs">
              <span className="text-[10px] uppercase font-bold text-cyan-400/70">Marks</span>
              <strong className="text-cyan-200 font-mono">{totalMarks.toLocaleString()}</strong>
            </div>
            <div className="flex items-center gap-1.5 bg-[#050914] border border-cyan-500/20 px-2 py-1 rounded-lg text-xs">
              <span className="text-[10px] uppercase font-bold text-cyan-400/70">Filled</span>
              <strong className="text-cyan-200 font-mono">{density}%</strong>
            </div>
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg border border-cyan-500/20 bg-[#050914] text-slate-300 hover:bg-cyan-950/50 hover:text-cyan-300 transition-colors"
              title={isMuted ? 'Turn sound on' : 'Mute sound'}
              aria-label={isMuted ? 'Turn sound on' : 'Mute sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel Navigation Tabs */}
      <nav className="grid grid-cols-3 px-3 pt-2.5 gap-1 font-sans border-b border-cyan-500/20 pb-2 bg-[#080e1b]/60" aria-label="GuestBook panels">
        {[
          { id: 'make', label: 'Draw', icon: Brush },
          { id: 'inspect', label: 'Inspect', icon: ScanSearch },
          { id: 'activity', label: `Notes${authenticMessageCount ? ` (${authenticMessageCount})` : ''}`, icon: MessageSquare }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              view === id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:bg-cyan-950/40 hover:text-cyan-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {view === 'make' && (
          <div className="space-y-4">
            
            {/* Tools Selector */}
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/80 mb-2">Tool</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {TOOLS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onSelectTool(id)}
                    title={label}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all h-[52px] ${
                      activeTool === id
                        ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                        : 'border-cyan-500/20 bg-[#070c18] text-slate-400 hover:border-cyan-500/40 hover:bg-cyan-950/30 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] leading-none mt-1 text-center">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Colors Palette (shown when tool is paint or stamp) */}
            {activeTool !== 'eraser' && activeTool !== 'pan' && activeTool !== 'inspect' && (
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/80 mb-2">Colour</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {PALETTE.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onSelectColor(color.hex)}
                      title={color.name}
                      aria-label={color.name}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center shrink-0 ${
                        activeColor === color.hex
                          ? 'border-white ring-2 ring-cyan-400 scale-110 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                          : 'border-slate-700/60 shadow-2xs'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Mini Stamps Selection */}
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/80 mb-2">Stamps (5×5)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {STAMPS.map((stamp) => {
                  const isSelected = activeTool === 'stamp' && activeStampId === stamp.id;
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => {
                        onSelectTool('stamp');
                        onSelectStamp(stamp.id);
                      }}
                      className={`flex items-center justify-start gap-2 rounded-xl border px-2.5 py-2 text-xs transition-all h-10 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/80 text-cyan-200 font-bold ring-1 ring-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                          : 'border-cyan-500/20 bg-[#070c18] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-950/30'
                      }`}
                    >
                      <span className="text-base shrink-0 flex items-center justify-center leading-none">{stamp.icon}</span>
                      <span className="truncate font-medium text-[11px] leading-tight">{stamp.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Undo & Redo Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/20 bg-[#070c18] py-2.5 text-xs font-semibold text-slate-300 hover:bg-cyan-950/40 hover:border-cyan-400/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/20 bg-[#070c18] py-2.5 text-xs font-semibold text-slate-300 hover:bg-cyan-950/40 hover:border-cyan-400/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                Redo
              </button>
            </div>

            {/* Leave a Note Card */}
            <form onSubmit={submit} className="rounded-2xl border border-cyan-500/20 bg-[#070c18] p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyan-200">Leave a note</h3>
              </div>
              
              <div className="relative">
                <UserRound className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-cyan-400/60" />
                <input
                  value={authorCallsign}
                  onChange={(e) => onChangeAuthor(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-xl border border-cyan-500/30 bg-[#040711] py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                  placeholder="@yourname"
                />
              </div>

              <textarea
                value={transmissionMessage}
                onChange={(e) => onChangeMessage(e.target.value.slice(0, 64))}
                maxLength={64}
                rows="2"
                className="w-full resize-none rounded-xl border border-cyan-500/30 bg-[#040711] px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
                placeholder="Say hello on this tile (optional)..."
              />

              {error && <p className="text-[11px] text-rose-400">{error}</p>}
              
              <button
                type="submit"
                disabled={isSending || cooldown > 0}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-2 text-xs font-bold text-black transition-all hover:opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                {isSending ? 'Posting…' : cooldown ? `Ready in ${Math.ceil(cooldown / 1000)}s` : 'Post note'}
              </button>
            </form>

            {/* Bottom Actions */}
            <div className="flex gap-2">
              <button
                onClick={onCenterGrid}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/20 bg-[#070c18] py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-950/40 hover:border-cyan-400/40 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Recenter grid
              </button>
              {onClearGrid && (
                <button
                  onClick={onClearGrid}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/70 transition-colors"
                  title="Clear cached local view"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear view
                </button>
              )}
            </div>
          </div>
        )}
        
        {view === 'inspect' && (
          <ReticleInspector
            hoveredCoord={hoveredCoord}
            cellData={hoveredCellData}
            authorCallsign={authorCallsign}
            transmissions={transmissions}
            isolatedAuthor={isolatedAuthor}
            onToggleIsolate={onToggleIsolate}
            onLocate={onLocate}
          />
        )}

        {view === 'activity' && (
          <TransmissionsFeed
            transmissions={transmissions}
            onLocate={onLocate}
          />
        )}
      </div>
    </aside>
  );
}

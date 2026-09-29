import React, { useState } from 'react';
import {
  Brush,
  Eraser,
  Stamp,
  Hand,
  Undo2,
  Redo2,
  MessageSquare,
  Sparkles,
  Palette,
  X
} from 'lucide-react';
import { PALETTE } from './palette.js';
import { STAMPS } from './stamps.js';

export function FloatingDock({
  activeTool,
  onSelectTool,
  activeColor,
  onSelectColor,
  activeStampId,
  onSelectStamp,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenDrawer,
  transmissionsCount = 0
}) {
  const [showStampPicker, setShowStampPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorSwatches = PALETTE.filter(c => !c.isEraser);

  const handleToolClick = (tool) => {
    setShowColorPicker(false);
    if (tool === 'stamp') {
      if (activeTool === 'stamp') {
        setShowStampPicker(!showStampPicker);
      } else {
        onSelectTool('stamp');
        setShowStampPicker(true);
      }
    } else {
      setShowStampPicker(false);
      onSelectTool(tool);
    }
  };

  const handleColorClick = (hex) => {
    onSelectColor(hex);
    setShowColorPicker(false);
    if (activeTool === 'eraser' || activeTool === 'pan') {
      onSelectTool('paint');
    }
  };

  const handleStampSelect = (stampId) => {
    onSelectStamp(stampId);
    onSelectTool('stamp');
    setShowStampPicker(false);
  };

  return (
    <div className="relative pointer-events-auto select-none">
      
      {/* ── STAMP PICKER POPOVER ── */}
      {showStampPicker && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 max-w-[92vw] bg-[#0c1424]/98 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-3 shadow-[0_15px_45px_rgba(0,0,0,0.8)] z-50 animate-fade-in text-cyan-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Choose Stamp</span>
            </div>
            <button
              onClick={() => setShowStampPicker(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close stamp picker"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {STAMPS.map((stamp) => {
              const isSelected = activeStampId === stamp.id && activeTool === 'stamp';
              return (
                <button
                  key={stamp.id}
                  onClick={() => handleStampSelect(stamp.id)}
                  title={`${stamp.name} (${stamp.category})`}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105'
                      : 'bg-[#060a14] border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-950/40'
                  }`}
                >
                  <span className="text-xl mb-1">{stamp.icon}</span>
                  <span className="text-[9px] text-slate-300 font-medium truncate max-w-full text-center">
                    {stamp.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MOBILE COLOR PALETTE POPOVER ── */}
      {showColorPicker && (
        <div className="sm:hidden absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 max-w-[92vw] bg-[#0c1424]/98 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-3 shadow-[0_15px_45px_rgba(0,0,0,0.8)] z-50 animate-fade-in text-cyan-100">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Color</span>
            </div>
            <button
              onClick={() => setShowColorPicker(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close color picker"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {colorSwatches.map((color) => {
              const isSelected = activeColor.toLowerCase() === color.hex.toLowerCase() && activeTool !== 'eraser';
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color.hex)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105'
                      : 'bg-[#060a14] border border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c1424]' : ''
                    }`}
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: isSelected ? `0 0 10px ${color.hex}` : 'none'
                    }}
                  />
                  <span className="text-[9px] text-slate-300 mt-1 font-medium truncate max-w-full text-center">
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN FLOATING PILL DOCK ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-[#0c1424]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-1.5 sm:p-2 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-slate-200">
        
        {/* Tool: Paint / Draw */}
        <button
          onClick={() => handleToolClick('paint')}
          title="Draw (Brush)"
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            activeTool === 'paint'
              ? 'bg-cyan-500 text-black shadow-[0_0_16px_rgba(0,240,255,0.6)] font-bold scale-105'
              : 'hover:bg-white/10 text-slate-300 active:scale-95'
          }`}
        >
          <Brush className="w-4 h-4" />
        </button>

        {/* Tool: Eraser */}
        <button
          onClick={() => handleToolClick('eraser')}
          title="Erase Pixels"
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            activeTool === 'eraser'
              ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] font-bold scale-105'
              : 'hover:bg-white/10 text-slate-300 active:scale-95'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Tool: Stamp */}
        <button
          onClick={() => handleToolClick('stamp')}
          title="Pixel Stamps"
          className={`relative p-2 rounded-xl transition-all flex items-center justify-center ${
            activeTool === 'stamp'
              ? 'bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.6)] font-bold scale-105'
              : 'hover:bg-white/10 text-slate-300 active:scale-95'
          }`}
        >
          <Stamp className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 text-[10px]">
            {STAMPS.find(s => s.id === activeStampId)?.icon || '👾'}
          </span>
        </button>

        {/* Tool: Pan / Hand */}
        <button
          onClick={() => handleToolClick('pan')}
          title="Pan & Move Canvas"
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            activeTool === 'pan'
              ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(245,158,11,0.6)] font-bold scale-105'
              : 'hover:bg-white/10 text-slate-300 active:scale-95'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-5 sm:h-6 bg-white/15 mx-0.5" />

        {/* ── MOBILE ACTIVE COLOR BUTTON (Toggles Color Picker Popover) ── */}
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowStampPicker(false);
          }}
          title="Choose Color"
          className={`sm:hidden p-1.5 rounded-xl transition-all flex items-center justify-center ${
            showColorPicker
              ? 'bg-white/20 ring-1 ring-cyan-400'
              : 'hover:bg-white/10 active:scale-95'
          }`}
        >
          <div
            className="w-5 h-5 rounded-full border border-white/80 shadow-sm"
            style={{
              backgroundColor: activeColor,
              boxShadow: `0 0 8px ${activeColor}`
            }}
          />
        </button>

        {/* ── DESKTOP COLOR SWATCHES (Visible on sm: and up) ── */}
        <div className="hidden sm:flex items-center gap-1.5 px-0.5">
          {colorSwatches.map((color) => {
            const isSelected = activeColor.toLowerCase() === color.hex.toLowerCase() && activeTool !== 'eraser';
            return (
              <button
                key={color.id}
                onClick={() => handleColorClick(color.hex)}
                title={`${color.name} (${color.hex})`}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-all shrink-0 ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c1424] scale-110'
                    : 'hover:scale-110 opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: isSelected ? `0 0 12px ${color.hex}` : 'none'
                }}
              />
            );
          })}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-5 sm:h-6 bg-white/15 mx-0.5" />

        {/* History: Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo"
          className="p-2 rounded-xl text-slate-300 hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* History: Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo"
          className="p-2 rounded-xl text-slate-300 hover:bg-white/10 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-5 sm:h-6 bg-white/15 mx-0.5" />

        {/* Transmissions Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          title="Guestbook Messages"
          className="relative p-2 rounded-xl text-slate-300 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          {transmissionsCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-pink-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              {transmissionsCount > 99 ? '99+' : transmissionsCount}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}

export default FloatingDock;

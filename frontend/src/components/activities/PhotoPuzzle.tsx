import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Lightbulb,
  RotateCcw,
  Check,
  Heart,
  Upload,
  Trophy,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { useTranslation } from 'react-i18next';

interface PhotoPuzzleProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

// Preset regional family & cultural memories
const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80';

const PRESET_MEMORIES = [
  {
    id: 'family',
    title: 'Family Gathering',
    caption: 'Recognize and remember your loved ones.',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bihu',
    title: 'Bihu Festival',
    caption: 'Celebrating springtime traditions together with family.',
    url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'tea-garden',
    title: 'Tea Estate Walk',
    caption: 'Peaceful morning stroll in the emerald hills.',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'majuli',
    title: 'Majuli Sunset',
    caption: 'Golden river reflections of our hometown heritage.',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
  },
];

const COLS = 4;
const ROWS = 3;
const TOTAL_PIECES = COLS * ROWS; // 12 pieces

interface TabConfig {
  top: number; // 0: flat, 1: tab, -1: blank
  right: number;
  bottom: number;
  left: number;
}

// Standard jigsaw interlocking tab shapes generator
const generateJigsawGrid = (cols: number, rows: number): TabConfig[] => {
  const horizontalTabs: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const rowTabs: number[] = [];
    for (let c = 0; c < cols - 1; c++) {
      rowTabs.push(Math.random() > 0.5 ? 1 : -1);
    }
    horizontalTabs.push(rowTabs);
  }

  const verticalTabs: number[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    const rowTabs: number[] = [];
    for (let c = 0; c < cols; c++) {
      rowTabs.push(Math.random() > 0.5 ? 1 : -1);
    }
    verticalTabs.push(rowTabs);
  }

  const grid: TabConfig[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const top = r === 0 ? 0 : -verticalTabs[r - 1][c];
      const right = c === cols - 1 ? 0 : horizontalTabs[r][c];
      const bottom = r === rows - 1 ? 0 : verticalTabs[r][c];
      const left = c === 0 ? 0 : -horizontalTabs[r][c - 1];
      grid.push({ top, right, bottom, left });
    }
  }
  return grid;
};

// SVG Path builder for a single jigsaw piece
const buildPiecePath = (
  x: number,
  y: number,
  w: number,
  h: number,
  tabs: TabConfig
): string => {
  const tabW = w * 0.22;
  const tabH = h * 0.22;

  let path = `M ${x} ${y} `;

  // 1. TOP EDGE: (x, y) -> (x + w, y)
  if (tabs.top === 0) {
    path += `L ${x + w} ${y} `;
  } else {
    const s = tabs.top;
    const midX = x + w / 2;
    path += `L ${midX - tabW} ${y} `;
    path += `C ${midX - tabW * 0.8} ${y - s * tabH * 0.2}, ${midX - tabW * 1.1} ${y - s * tabH * 0.9}, ${midX - tabW * 0.4} ${y - s * tabH} `;
    path += `C ${midX - tabW * 0.1} ${y - s * tabH * 1.05}, ${midX + tabW * 0.1} ${y - s * tabH * 1.05}, ${midX + tabW * 0.4} ${y - s * tabH} `;
    path += `C ${midX + tabW * 1.1} ${y - s * tabH * 0.9}, ${midX + tabW * 0.8} ${y - s * tabH * 0.2}, ${midX + tabW} ${y} `;
    path += `L ${x + w} ${y} `;
  }

  // 2. RIGHT EDGE: (x + w, y) -> (x + w, y + h)
  if (tabs.right === 0) {
    path += `L ${x + w} ${y + h} `;
  } else {
    const s = tabs.right;
    const midY = y + h / 2;
    path += `L ${x + w} ${midY - tabH} `;
    path += `C ${x + w + s * tabW * 0.2} ${midY - tabH * 0.8}, ${x + w + s * tabW * 0.9} ${midY - tabH * 1.1}, ${x + w + s * tabW} ${midY - tabH * 0.4} `;
    path += `C ${x + w + s * tabW * 1.05} ${midY - tabH * 0.1}, ${x + w + s * tabW * 1.05} ${midY + tabH * 0.1}, ${x + w + s * tabW} ${midY + tabH * 0.4} `;
    path += `C ${x + w + s * tabW * 0.9} ${midY + tabH * 1.1}, ${x + w + s * tabW * 0.2} ${midY + tabH * 0.8}, ${x + w} ${midY + tabH} `;
    path += `L ${x + w} ${y + h} `;
  }

  // 3. BOTTOM EDGE: (x + w, y + h) -> (x, y + h)
  if (tabs.bottom === 0) {
    path += `L ${x} ${y + h} `;
  } else {
    const s = tabs.bottom;
    const midX = x + w / 2;
    path += `L ${midX + tabW} ${y + h} `;
    path += `C ${midX + tabW * 0.8} ${y + h + s * tabH * 0.2}, ${midX + tabW * 1.1} ${y + h + s * tabH * 0.9}, ${midX + tabW * 0.4} ${y + h + s * tabH} `;
    path += `C ${midX + tabW * 0.1} ${y + h + s * tabH * 1.05}, ${midX - tabW * 0.1} ${y + h + s * tabH * 1.05}, ${midX - tabW * 0.4} ${y + h + s * tabH} `;
    path += `C ${midX - tabW * 1.1} ${y + h + s * tabH * 0.9}, ${midX - tabW * 0.8} ${y + h + s * tabH * 0.2}, ${midX - tabW} ${y + h} `;
    path += `L ${x} ${y + h} `;
  }

  // 4. LEFT EDGE: (x, y + h) -> (x, y)
  if (tabs.left === 0) {
    path += `L ${x} ${y} `;
  } else {
    const s = tabs.left;
    const midY = y + h / 2;
    path += `L ${x} ${midY + tabH} `;
    path += `C ${x - s * tabW * 0.2} ${midY + tabH * 0.8}, ${x - s * tabW * 0.9} ${midY + tabH * 1.1}, ${x - s * tabW} ${midY + tabH * 0.4} `;
    path += `C ${x - s * tabW * 1.05} ${midY + tabH * 0.1}, ${x - s * tabW * 1.05} ${midY - tabH * 0.1}, ${x - s * tabW} ${midY - tabH * 0.4} `;
    path += `C ${x - s * tabW * 0.9} ${midY - tabH * 1.1}, ${x - s * tabW * 0.2} ${midY - tabH * 0.8}, ${x} ${midY - tabH} `;
    path += `L ${x} ${y} `;
  }

  path += 'Z';
  return path;
};

export const PhotoPuzzle: React.FC<PhotoPuzzleProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Puzzle photo state
  const [photoUrl, setPhotoUrl] = useState<string>(PRESET_MEMORIES[0].url);
  const [caption, setCaption] = useState<string>(PRESET_MEMORIES[0].caption);

  // Puzzle Board State (Board width 800 x 540)
  const BOARD_W = 800;
  const BOARD_H = 540;
  const PIECE_W = BOARD_W / COLS;
  const PIECE_H = BOARD_H / ROWS;

  // Generate stable jigsaw tabs
  const tabConfigs = useMemo(() => generateJigsawGrid(COLS, ROWS), []);

  // Pre-place pieces matching screenshot (5 missing slots: 2, 4, 6, 8, 10)
  const [placedSlots, setPlacedSlots] = useState<boolean[]>(() => {
    const initial = Array(TOTAL_PIECES).fill(true);
    [2, 4, 6, 8, 10].forEach((idx) => {
      initial[idx] = false;
    });
    return initial;
  });

  // Tray pieces (contains indices of pieces that are currently NOT placed on the board)
  const [trayPieces, setTrayPieces] = useState<number[]>([2, 4, 6, 8, 10]);

  // Selected piece from tray
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);

  // Gameplay metrics & Timer
  const [moveCount, setMoveCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Live Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!isCompleted) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCompleted, startTime]);

  // Format seconds to mm:ss
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Sound Engine
  const playSound = (freq = 520, duration = 0.12, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      }
    } catch {
      // Audio fallback
    }
  };

  // Kind-hearted harmonious completion chord progression
  const playKindHeartedMelody = useCallback(() => {
    const melody = [
      { freq: 440.0, delay: 0 }, // A4
      { freq: 554.37, delay: 140 }, // C#5
      { freq: 659.25, delay: 280 }, // E5
      { freq: 880.0, delay: 420 }, // A5
      { freq: 1108.73, delay: 580 }, // C#6
    ];
    melody.forEach((note) => {
      setTimeout(() => playSound(note.freq, 0.4, 'sine'), note.delay);
    });
  }, []);

  // Place a piece onto a specific board slot
  const handlePlacePiece = useCallback(
    (pieceIdx: number, slotIdx: number) => {
      setMoveCount((m) => m + 1);

      if (pieceIdx === slotIdx) {
        // Correct placement!
        playSound(659.25, 0.2, 'sine');
        setPlacedSlots((prev) => {
          const next = [...prev];
          next[slotIdx] = true;
          return next;
        });
        setTrayPieces((prev) => prev.filter((p) => p !== pieceIdx));
        setSelectedPiece(null);

        // Check completion
        const remainingMissing = trayPieces.filter((p) => p !== pieceIdx).length;
        if (remainingMissing === 0) {
          playKindHeartedMelody();
          setIsCompleted(true);
          const elapsed = Date.now() - startTime;
          onComplete(100, moveCount + 1, elapsed);
        }
      } else {
        // Wrong slot attempt: gentle reminder
        playSound(280, 0.18, 'sine');
        setMessage('That is wrong. Take your time, try another opening! 🌸');
        setTimeout(() => setMessage(''), 3000);
        setSelectedPiece(null);
      }
    },
    [moveCount, onComplete, playKindHeartedMelody, startTime, trayPieces]
  );

  // Handle click on missing slot in the board
  const handleSlotClick = (slotIdx: number) => {
    if (placedSlots[slotIdx]) return;

    if (selectedPiece !== null) {
      handlePlacePiece(selectedPiece, slotIdx);
    } else {
      setMessage('Tap a piece on the right tray first, then tap this slot!');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (slotIdx: number) => {
    if (draggedPiece !== null) {
      handlePlacePiece(draggedPiece, slotIdx);
      setDraggedPiece(null);
    }
  };

  // Restart Puzzle
  const handleRestart = () => {
    const missing = [2, 4, 6, 8, 10];
    const initial = Array(TOTAL_PIECES).fill(true);
    missing.forEach((idx) => {
      initial[idx] = false;
    });
    setPlacedSlots(initial);
    setTrayPieces(missing);
    setSelectedPiece(null);
    setIsCompleted(false);
    setMoveCount(0);
    setStartTime(Date.now());
    setElapsedSeconds(0);
    playSound(440, 0.1);
  };

  // Hint: automatically place one missing piece
  const handleHint = () => {
    if (trayPieces.length === 0) return;
    const hintPiece = trayPieces[0];
    handlePlacePiece(hintPiece, hintPiece);
    setMessage(`Hint: Placed piece #${hintPiece + 1}!`);
    setTimeout(() => setMessage(''), 2500);
  };

  // Upload custom photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'My Family Photo');
      handleRestart();
    }
  };

  // Pre-calculate SVG paths for all 12 pieces
  const piecePaths = useMemo(() => {
    return Array.from({ length: TOTAL_PIECES }).map((_, idx) => {
      const r = Math.floor(idx / COLS);
      const c = idx % COLS;
      const x = c * PIECE_W;
      const y = r * PIECE_H;
      return buildPiecePath(x, y, PIECE_W, PIECE_H, tabConfigs[idx]);
    });
  }, [PIECE_H, PIECE_W, tabConfigs]);

  return (
    <div className="min-h-[85vh] bg-white p-3 sm:p-6 rounded-3xl font-sans text-[#442818] select-none flex flex-col justify-between max-w-6xl mx-auto shadow-xl border border-slate-200">
      {/* ── Top Header matching reference image with live timer ────────── */}
      <div>
        <div className="flex items-center justify-between px-2 pt-2">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#794D2C] hover:bg-[#623D21] text-white font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Back
          </button>

          {/* Title & Subtitle */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#442818]">
              Family Photo Puzzle
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#7D5B48] mt-0.5">
              Drag and drop the pieces to complete the family photo.
            </p>
          </div>

          {/* Right Area: Timer & Hint Button */}
          <div className="flex items-center gap-2.5">
            {/* Live Stopwatch Timer */}
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-[#794D2C] font-black text-xs sm:text-sm shadow-sm">
              <Clock className="w-4 h-4 text-[#794D2C]" />
              <span className="tabular-nums">{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Hint Button */}
            <button
              onClick={handleHint}
              disabled={trayPieces.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Hint</span>
            </button>
          </div>
        </div>

        {/* Gentle Reminder feedback message */}
        {message && (
          <div className="text-center mt-3 animate-fadeIn">
            <span
              className={`inline-block px-5 py-2 rounded-full font-bold text-xs sm:text-sm shadow-md transition-all ${
                message.includes('wrong')
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 animate-bounce'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {message}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Section: Wooden Puzzle Board (Left) + Pieces Tray (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 items-center justify-center">
        {/* LEFT: Wooden Framed Puzzle Canvas (8 cols) */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="relative p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-[#C49B6A] via-[#9B7043] to-[#6E4822] shadow-[0_12px_30px_rgba(75,45,20,0.30)] border-4 border-[#5E3A1A] max-w-[760px] w-full">
            {/* Inner frame bevel */}
            <div className="relative rounded-2xl overflow-hidden shadow-inner border-2 border-[#4A2D14] bg-[#F2E5D5] aspect-[800/540]">
              <svg
                viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
                className="w-full h-full block"
              >
                <defs>
                  {/* ClipPaths for all 12 puzzle pieces */}
                  {piecePaths.map((d, idx) => (
                    <clipPath key={`clip_${idx}`} id={`jigsaw_clip_${idx}`}>
                      <path d={d} />
                    </clipPath>
                  ))}
                </defs>

                {/* 1. Base cream cutout layer with indented puzzle piece outlines */}
                {Array.from({ length: TOTAL_PIECES }).map((_, idx) => {
                  const isPlaced = placedSlots[idx];
                  const isSlotSelected = selectedPiece === idx;

                  return (
                    <g
                      key={`slot_bg_${idx}`}
                      onClick={() => handleSlotClick(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className="cursor-pointer"
                    >
                      {/* Cream cutout shape for missing slots */}
                      <path
                        d={piecePaths[idx]}
                        fill={isPlaced ? 'none' : isSlotSelected ? '#E2C8AD' : '#F5E8D8'}
                        stroke="#B89B7D"
                        strokeWidth="1.5"
                        strokeDasharray={isPlaced ? 'none' : '3 2'}
                        className="transition-colors"
                      />
                    </g>
                  );
                })}

                {/* 2. Placed pieces layer with full photographic fidelity */}
                {Array.from({ length: TOTAL_PIECES }).map((_, idx) => {
                  const isPlaced = placedSlots[idx];
                  if (!isPlaced) return null;

                  return (
                    <g key={`placed_piece_${idx}`}>
                      {/* Photo Image clipped to piece jigsaw contour */}
                      <image
                        href={photoUrl}
                        x="0"
                        y="0"
                        width={BOARD_W}
                        height={BOARD_H}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#jigsaw_clip_${idx})`}
                      />

                      {/* Subtle piece contour seam line */}
                      <path
                        d={piecePaths[idx]}
                        fill="none"
                        stroke="rgba(0, 0, 0, 0.22)"
                        strokeWidth="1.2"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT: Available Jigsaw Puzzle Pieces Tray (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center">
          <div className="w-full max-w-[340px] bg-slate-50/70 rounded-3xl p-3 border-2 border-dashed border-[#DFC8B4]/80">
            <div className="grid grid-cols-2 gap-3 justify-items-center">
              {trayPieces.map((pieceIdx) => {
                const r = Math.floor(pieceIdx / COLS);
                const c = pieceIdx % COLS;
                const isSelected = selectedPiece === pieceIdx;

                // ViewBox bounds with safety padding for tabs
                const padding = 55;
                const minX = c * PIECE_W - padding;
                const minY = r * PIECE_H - padding;
                const boxW = PIECE_W + padding * 2;
                const boxH = PIECE_H + padding * 2;

                return (
                  <div
                    key={`tray_piece_${pieceIdx}`}
                    draggable
                    onDragStart={() => setDraggedPiece(pieceIdx)}
                    onClick={() =>
                      setSelectedPiece(isSelected ? null : pieceIdx)
                    }
                    className={`relative w-28 sm:w-32 aspect-[200/180] cursor-grab active:cursor-grabbing transition-all duration-200 transform ${
                      isSelected
                        ? 'scale-110 -translate-y-1.5 drop-shadow-[0_12px_18px_rgba(121,77,44,0.45)] ring-4 ring-[#794D2C] rounded-2xl z-20'
                        : 'hover:scale-105 hover:-translate-y-1 drop-shadow-[0_6px_10px_rgba(75,45,20,0.22)]'
                    }`}
                  >
                    <svg
                      viewBox={`${minX} ${minY} ${boxW} ${boxH}`}
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <clipPath id={`tray_clip_${pieceIdx}`}>
                          <path d={piecePaths[pieceIdx]} />
                        </clipPath>
                      </defs>

                      {/* Drop shadow shape behind jigsaw piece */}
                      <path
                        d={piecePaths[pieceIdx]}
                        fill="none"
                        stroke="rgba(0,0,0,0.15)"
                        strokeWidth="4"
                      />

                      {/* Image slice clipped to jigsaw shape */}
                      <image
                        href={photoUrl}
                        x="0"
                        y="0"
                        width={BOARD_W}
                        height={BOARD_H}
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#tray_clip_${pieceIdx})`}
                      />

                      {/* Crisp Jigsaw Edge border */}
                      <path
                        d={piecePaths[pieceIdx]}
                        fill="none"
                        stroke="#5A3A1F"
                        strokeWidth="2.2"
                      />
                    </svg>

                    {isSelected && (
                      <span className="absolute top-1 right-1 bg-[#794D2C] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {trayPieces.length === 0 && (
              <div className="py-12 text-center text-[#7D5B48] font-bold text-sm flex flex-col items-center gap-2">
                <Check className="w-8 h-8 text-emerald-600 stroke-[3]" />
                <span>All pieces placed on the board!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Controls Bar matching reference image ──────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-2">
        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart</span>
        </button>

        {/* Center Pill Badge */}
        <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#F5EBE1] border border-[#E9DACD] text-[#794D2C] font-bold text-xs sm:text-sm shadow-sm">
          <Heart className="w-4 h-4 text-[#794D2C] fill-[#794D2C]" />
          <span>{caption}</span>
        </div>

        {/* Check / Complete Button & Photo Upload */}
        <div className="flex items-center gap-2">
          {/* Hidden Photo Upload Trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-bold text-xs border border-[#E5D3C2] shadow-sm transition-all"
            title="Upload custom family photo"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (trayPieces.length === 0) {
                playKindHeartedMelody();
                setIsCompleted(true);
              } else {
                setMessage(`Place the remaining ${trayPieces.length} pieces to complete!`);
                setTimeout(() => setMessage(''), 2500);
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Check</span>
          </button>
        </div>
      </div>

      {/* ── Warm, Kindhearted Completion Celebration Modal ────────────── */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full text-center space-y-5 border-4 border-[#794D2C] shadow-2xl animate-scaleIn">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#794D2C] to-[#A06B43] text-white flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="px-4 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider border border-emerald-200">
                ✨ Splendid Work!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#442818]">
                Family Memory Restored!
              </h3>
              <p className="text-sm sm:text-base font-semibold text-[#7D5B48] max-w-sm mx-auto">
                You lovingly and patiently pieced together this cherished family photo in{' '}
                <span className="font-extrabold text-[#442818] underline">
                  {formatTime(elapsedSeconds)}
                </span>
                !
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border-3 border-[#794D2C] shadow-md aspect-[800/540]">
              <img
                src={photoUrl}
                alt="Completed Family Photo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 rounded-2xl bg-white hover:bg-slate-50 text-[#794D2C] font-black text-sm border-2 border-[#E5D3C2] shadow-sm active:scale-95 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-2xl bg-[#794D2C] hover:bg-[#623D21] text-white font-black text-sm shadow-md active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPuzzle;

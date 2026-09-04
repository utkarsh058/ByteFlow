import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Layers,
  Heart,
  Trophy,
  Camera,
  Play,
  RotateCcw,
} from 'lucide-react';
import { photoPuzzleModuleApi } from '../../services/api';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface PhotoPuzzleProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

interface Piece {
  pieceIndex: number;
  imageUrl: string;
  placedRow?: number;
  placedCol?: number;
  isCorrect?: boolean;
}

// Preset regional & nostalgic memories for immediate play without local photo
const PRESET_MEMORIES = [
  {
    id: 'bihu',
    title: 'Bihu Festival Celebration',
    caption: 'Rongali Bihu Spring Celebration with Family, Assam',
    url: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tea-garden',
    title: 'Upper Assam Tea Estate',
    caption: 'Peaceful morning walk across emerald tea plantations',
    url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'majuli',
    title: 'Majuli Island Sunset',
    caption: 'Sunset reflections on the sacred Brahmaputra River',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'kaziranga',
    title: 'Kaziranga Wildlife Safari',
    caption: 'Majestic Greater One-Horned Rhino in Kaziranga National Park',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
  },
];

export const PhotoPuzzle: React.FC<PhotoPuzzleProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup state
  const [mode, setMode] = useState<'upload_setup' | 'playing' | 'completed'>('upload_setup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(PRESET_MEMORIES[0].url);
  const [caption, setCaption] = useState<string>(PRESET_MEMORIES[0].caption);
  const [gridSize, setGridSize] = useState<2 | 3>(2); // 2x2 = 4 pieces (default gentle mode for dementia care)
  const [isSlicing, setIsSlicing] = useState<boolean>(false);

  // Gameplay state
  const [puzzleId, setPuzzleId] = useState<string>('');
  const [unplacedPieces, setUnplacedPieces] = useState<Piece[]>([]);
  const [boardSlots, setBoardSlots] = useState<Record<string, Piece | null>>({});
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [showHintPeek, setShowHintPeek] = useState<boolean>(true);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'My Cherished Photo');
    }
  };

  // Handle preset selection
  const handleSelectPreset = (preset: (typeof PRESET_MEMORIES)[0]) => {
    setSelectedFile(null);
    setPreviewUrl(preset.url);
    setCaption(preset.caption);
  };

  // Create & Slice Puzzle on backend
  const handleStartPuzzle = async () => {
    setIsSlicing(true);
    try {
      const formData = new FormData();
      formData.append('rows', String(gridSize));
      formData.append('cols', String(gridSize));
      formData.append('patientId', 'pat-ner-001');
      formData.append('caption', caption);

      if (selectedFile) {
        formData.append('photo', selectedFile);
      } else {
        // Fetch preset image as blob to send to multer
        try {
          const res = await fetch(previewUrl);
          const blob = await res.blob();
          formData.append('photo', blob, 'preset.jpg');
        } catch {
          // If CORS prevents fetch, backend has fallback
        }
      }

      const puzzleData = await photoPuzzleModuleApi.createPuzzle(formData);
      setPuzzleId(puzzleData.puzzleId);

      // Initialize pieces
      const pieces: Piece[] = (puzzleData.pieces || []).map((p: any) => ({
        pieceIndex: p.pieceIndex,
        imageUrl: p.imageUrl,
      }));

      // Shuffle tray
      setUnplacedPieces([...pieces].sort(() => Math.random() - 0.5));

      // Clear board slots
      const initialSlots: Record<string, Piece | null> = {};
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          initialSlots[`${r}_${c}`] = null;
        }
      }
      setBoardSlots(initialSlots);
      setSelectedPieceIndex(null);
      setAttemptsCount(0);
      setCorrectCount(0);
      setStartTime(Date.now());
      setMode('playing');
    } catch (err) {
      console.error('Failed to create puzzle:', err);
      // Fallback local mock puzzle for offline resilience
      createFallbackPuzzle();
    } finally {
      setIsSlicing(false);
    }
  };

  const createFallbackPuzzle = () => {
    const total = gridSize * gridSize;
    const pieces: Piece[] = [];
    for (let i = 0; i < total; i++) {
      pieces.push({ pieceIndex: i, imageUrl: previewUrl });
    }
    setPuzzleId(`offline_${Date.now()}`);
    setUnplacedPieces([...pieces].sort(() => Math.random() - 0.5));
    const initialSlots: Record<string, Piece | null> = {};
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        initialSlots[`${r}_${c}`] = null;
      }
    }
    setBoardSlots(initialSlots);
    setMode('playing');
  };

  // Click slot on board
  const handleSlotClick = async (targetRow: number, targetCol: number) => {
    const slotKey = `${targetRow}_${targetCol}`;
    const existingInSlot = boardSlots[slotKey];

    // If slot already occupied and no piece selected, return piece back to tray
    if (existingInSlot && selectedPieceIndex === null) {
      setBoardSlots((prev) => ({ ...prev, [slotKey]: null }));
      setUnplacedPieces((prev) => [...prev, existingInSlot]);
      if (existingInSlot.isCorrect) {
        setCorrectCount((c) => Math.max(0, c - 1));
      }
      return;
    }

    if (selectedPieceIndex === null) return;

    // Find the selected piece from tray
    const piece = unplacedPieces.find((p) => p.pieceIndex === selectedPieceIndex);
    if (!piece) return;

    setAttemptsCount((a) => a + 1);

    // Calculate expected index for this slot
    const expectedPieceIndex = targetRow * gridSize + targetCol;
    const isCorrect = piece.pieceIndex === expectedPieceIndex;

    // Call backend check endpoint to log and verify
    if (puzzleId && !puzzleId.startsWith('offline_')) {
      try {
        await photoPuzzleModuleApi.checkPiece({
          puzzleId,
          pieceIndex: piece.pieceIndex,
          targetRow,
          targetCol,
        });
      } catch (e) {
        console.error('Check API failed:', e);
      }
    }

    // Place piece on board
    const placedPiece: Piece = {
      ...piece,
      placedRow: targetRow,
      placedCol: targetCol,
      isCorrect,
    };

    setBoardSlots((prev) => ({ ...prev, [slotKey]: placedPiece }));
    setUnplacedPieces((prev) => prev.filter((p) => p.pieceIndex !== selectedPieceIndex));
    setSelectedPieceIndex(null);

    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) setCorrectCount(newCorrect);

    // Check completion
    const totalPieces = gridSize * gridSize;
    if (newCorrect === totalPieces) {
      setTimeout(() => {
        setMode('completed');
        const elapsed = Date.now() - startTime;
        const accuracy = Math.round((totalPieces / Math.max(attemptsCount + 1, totalPieces)) * 100);
        onComplete(accuracy, attemptsCount + 1, elapsed);
      }, 700);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-xl border border-slate-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Activity
        </button>

        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Layers className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-black text-slate-900">Personalized Photo Puzzle</h2>
        </div>

        {mode === 'playing' && (
          <button
            onClick={() => setShowHintPeek(!showHintPeek)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showHintPeek
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {showHintPeek ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHintPeek ? 'Guide On' : 'Guide Off'}
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: UPLOAD & SETUP SCREEN                                            */}
      {/* ========================================================================= */}
      {mode === 'upload_setup' && (
        <div className="py-6 space-y-8 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-slate-800">
              Upload Any Cherished Photo to Begin
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Reconstructing familiar family photos, home gardens, or festivals stimulates visual reminiscence and neuroplasticity.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: File Uploader Area */}
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 p-6 rounded-2xl cursor-pointer text-center transition-all flex flex-col items-center justify-center min-h-[220px]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to Upload Your Photo'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports JPEG, PNG, or WebP (Family portraits, weddings, vacations)
                </p>
                <span className="mt-3 px-3 py-1 rounded-full bg-purple-200/60 text-purple-800 text-xs font-bold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> Choose from Device
                </span>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Photo Memory Caption / Story
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. You and Priya at Kaziranga, Winter 2018"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                />
              </div>

              {/* Grid Size Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Puzzle Difficulty
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGridSize(2)}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gridSize === 2
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>2 × 2 (4 Pieces)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">Gentle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGridSize(3)}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      gridSize === 3
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>3 × 3 (9 Pieces)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">Standard</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                <img
                  src={previewUrl}
                  alt="Puzzle Target Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/60 pointer-events-none grid grid-cols-2 grid-rows-2">
                  <div className="border border-white/40" />
                  <div className="border border-white/40" />
                  <div className="border border-white/40" />
                  <div className="border border-white/40" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-semibold">
                  {caption}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartPuzzle}
                disabled={isSlicing}
                className="mt-6 w-full max-w-[320px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isSlicing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Slicing Photo with Sharp...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Puzzle ({gridSize * gridSize} Pieces)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preset Cultural Memories Strip */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Or Choose from Cultural Heritage Memories:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_MEMORIES.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                    previewUrl === preset.url
                      ? 'bg-purple-50 border-purple-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-18 object-cover rounded-lg mb-1.5"
                  />
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{preset.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE PLAYING SCREEN                                       */}
      {/* ========================================================================= */}
      {mode === 'playing' && (
        <div className="py-6 space-y-6 animate-fadeIn">
          {/* Progress Strip */}
          <div className="flex items-center justify-between bg-purple-50 p-3 rounded-2xl border border-purple-100">
            <div>
              <p className="text-xs text-purple-700 font-bold uppercase">Placed Pieces</p>
              <p className="text-lg font-black text-purple-900">
                {correctCount} <span className="text-xs font-semibold">/ {gridSize * gridSize} Correct</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Memory</p>
              <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[200px]">{caption}</p>
            </div>
          </div>

          {/* Main Gameplay Layout: Left Grid Board, Right Pieces Tray */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Target Puzzle Board */}
            <div className="md:col-span-7 flex flex-col items-center">
              <div
                className="relative w-full max-w-[360px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 grid gap-1 p-1"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                }}
              >
                {/* Background faint guide watermark */}
                {showHintPeek && (
                  <img
                    src={previewUrl}
                    alt="Guide"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                  />
                )}

                {/* Slots */}
                {Array.from({ length: gridSize }).map((_, row) =>
                  Array.from({ length: gridSize }).map((_, col) => {
                    const slotKey = `${row}_${col}`;
                    const placedPiece = boardSlots[slotKey];
                    const isSelected = selectedPieceIndex !== null;

                    return (
                      <div
                        key={slotKey}
                        onClick={() => handleSlotClick(row, col)}
                        className={`relative rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer overflow-hidden ${
                          placedPiece
                            ? placedPiece.isCorrect
                              ? 'border-emerald-500 bg-emerald-950/20'
                              : 'border-rose-500 bg-rose-950/20'
                            : isSelected
                            ? 'border-purple-400 border-dashed hover:bg-purple-500/20 animate-pulse'
                            : 'border-slate-700/60 border-dashed hover:border-slate-500'
                        }`}
                      >
                        {placedPiece ? (
                          <div className="relative w-full h-full">
                            {/* Slice preview simulation or backend image */}
                            <div
                              className="w-full h-full bg-cover bg-no-repeat"
                              style={{
                                backgroundImage: `url(${previewUrl})`,
                                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`,
                              }}
                            />
                            {placedPiece.isCorrect && (
                              <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-500">
                            Slot {row + 1},{col + 1}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <p className="text-xs text-slate-500 mt-2 text-center">
                {selectedPieceIndex !== null
                  ? '👉 Tap an empty slot on the board to place your piece.'
                  : '👉 Tap a piece from the tray below to select it.'}
              </p>
            </div>

            {/* Unplaced Pieces Tray */}
            <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Available Pieces</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                    {unplacedPieces.length}
                  </span>
                </h4>
              </div>

              {unplacedPieces.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  All pieces are on the board! Check if they are in the correct slots.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {unplacedPieces.map((piece) => {
                    const isSelected = selectedPieceIndex === piece.pieceIndex;
                    const pRow = Math.floor(piece.pieceIndex / gridSize);
                    const pCol = piece.pieceIndex % gridSize;

                    return (
                      <div
                        key={piece.pieceIndex}
                        onClick={() =>
                          setSelectedPieceIndex(isSelected ? null : piece.pieceIndex)
                        }
                        className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-purple-600 ring-4 ring-purple-300 scale-105 shadow-lg'
                            : 'border-slate-300 hover:border-purple-400 hover:scale-102'
                        }`}
                      >
                        <div
                          className="w-full h-full bg-cover bg-no-repeat"
                          style={{
                            backgroundImage: `url(${previewUrl})`,
                            backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                            backgroundPosition: `${(pCol / (gridSize - 1)) * 100}% ${(pRow / (gridSize - 1)) * 100}%`,
                          }}
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-bold">
                          Piece #{piece.pieceIndex + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: COMPLETION CELEBRATION                                           */}
      {/* ========================================================================= */}
      {mode === 'completed' && (
        <div className="py-8 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-3xl font-black text-slate-900">
              Wonderful Job! Memory Reconstructed!
            </h3>
            <p className="text-base text-slate-600 max-w-md mx-auto mt-1">
              "{caption}"
            </p>
          </div>

          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-4 border-emerald-400 shadow-2xl mx-auto">
            <img src={previewUrl} alt="Reconstructed Photo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-white font-bold">
              <span>{caption}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setMode('upload_setup')}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              Upload Another Photo
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
            >
              Return to Activities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPuzzle;
